import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import PDFDocument from "pdfkit";
import { getDb } from "@/lib/mongodb";
import { requireAuth, isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

function formatMoney(value) {
  return `Rs ${Math.round(Number(value || 0))}`;
}

function formatDate(date) {
  try {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export async function GET(req, { params }) {
  const { user, response } = requireAuth(req);
  if (response) return response;

  try {
    const orderId = params?.id;
    if (!orderId) {
      return NextResponse.json({ error: "Order id is required" }, { status: 400 });
    }

    const db = await getDb();
    const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!isAdmin(user) && order.userId !== user.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pdfBuffer = await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fontSize(22).text("Plantity Invoice", { align: "left" });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor("#555555").text(`Invoice for order #${order._id}`);
      doc.text(`Created: ${formatDate(order.createdAt)}`);
      if (order.paidAt) {
        doc.text(`Paid: ${formatDate(order.paidAt)}`);
      }

      doc.moveDown();
      doc.fillColor("#111111").fontSize(12).text("Customer");
      doc.fontSize(10);
      doc.text(order.delivery?.name || order.email || "Customer");
      doc.text(order.delivery?.address || "");
      doc.text(`${order.delivery?.city || ""} ${order.delivery?.pincode || ""}`.trim());
      if (order.phone) doc.text(order.phone);

      doc.moveDown();
      doc.fontSize(12).text("Order Summary");
      doc.moveDown(0.5);

      const items = Array.isArray(order.items) ? order.items : [];
      items.forEach((item) => {
        const qty = Number(item.quantity || 1);
        const price = formatMoney(item.price);
        doc.fontSize(10).text(`${qty} x ${item.name}`, { continued: true });
        doc.text(price, { align: "right" });
      });

      doc.moveDown(0.5);
      doc.text(`Subtotal: ${formatMoney(order.totals?.subtotal)}`, { align: "right" });
      doc.text(`Delivery: ${formatMoney(order.totals?.delivery)}`, { align: "right" });
      doc.text(`GST (5%): ${formatMoney(order.totals?.taxes)}`, { align: "right" });
      doc.moveDown(0.2);
      doc.fontSize(12).text(`Total: ${formatMoney(order.totals?.total)}`, { align: "right" });

      doc.moveDown();
      doc.fontSize(10).fillColor("#555555");
      doc.text(`Payment status: ${order.paymentStatus || order.status || "pending"}`);
      doc.text(`Order status: ${order.orderStatus || "placed"}`);

      doc.end();
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=plantity-invoice-${orderId}.pdf`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}

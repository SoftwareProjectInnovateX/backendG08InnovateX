import express, { Request, Response } from "express";

const router = express.Router();

// ==============================
// TYPE FOR CART ITEM
// ==============================
interface CartItem {
  id: number;
  [key: string]: any; // allows dynamic fields (name, price, etc.)
}

// In-memory cart (replace with DB later)
let cart: CartItem[] = [];

// ==============================
// GET ALL CART ITEMS
// ==============================
router.get("/", (req: Request, res: Response) => {
  res.json(cart);
});

// ==============================
// ADD ITEM TO CART
// ==============================
router.post("/", (req: Request, res: Response) => {
  const item: CartItem = {
    ...req.body,
    id: Date.now(),
  };

  cart.push(item);
  res.json(item);
});

// ==============================
// DELETE SINGLE ITEM
// ==============================
router.delete("/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  cart = cart.filter((i) => i.id !== id);

  res.json({ success: true });
});

// ==============================
// CLEAR CART
// ==============================
router.delete("/", (req: Request, res: Response) => {
  cart = [];
  res.json({ success: true });
});

export default router;
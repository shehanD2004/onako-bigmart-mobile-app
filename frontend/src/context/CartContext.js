import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

// ── Helper to build per-user storage key ──
const getCartKey = (userId) =>
  userId ? `cartItems_${userId}` : "cartItems_guest";

// ── Calculate totals (mirrors web cartSlice calculateTotals) ──
const calculateTotals = (items) => {
  let totalQuantity = 0;
  let totalAmount = 0;

  items.forEach((item) => {
    const itemTotal = (item.pricePerUnit || 0) * (item.cartQuantity || 0);
    totalAmount += itemTotal;
    totalQuantity += item.cartQuantity || 0;
  });

  return {
    cartTotalQuantity: totalQuantity,
    cartTotalAmount: totalAmount,
  };
};

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [cartKey, setCartKey] = useState(getCartKey(null));

  // ── Load cart from AsyncStorage when user changes ──
  useEffect(() => {
    const loadCart = async () => {
      const newKey = getCartKey(user?._id);
      setCartKey(newKey);

      try {
        const stored = await AsyncStorage.getItem(newKey);
        const parsedItems = stored ? JSON.parse(stored) : [];

        // Merge guest cart into user cart on login
        if (user?._id) {
          const guestStored = await AsyncStorage.getItem("cartItems_guest");
          const guestItems = guestStored ? JSON.parse(guestStored) : [];

          if (guestItems.length > 0) {
            const merged = [...parsedItems];
            guestItems.forEach((guestItem) => {
              const existingIdx = merged.findIndex(
                (i) => i._id === guestItem._id
              );
              if (existingIdx >= 0) {
                merged[existingIdx].cartQuantity += guestItem.cartQuantity;
              } else {
                merged.push(guestItem);
              }
            });
            await AsyncStorage.removeItem("cartItems_guest");
            await AsyncStorage.setItem(newKey, JSON.stringify(merged));
            setCartItems(merged);
            return;
          }
        }

        setCartItems(parsedItems);
      } catch (err) {
        console.warn("Failed to load cart:", err);
        setCartItems([]);
      }
    };

    loadCart();
  }, [user]);

  // ── Persist helper ──
  const persistCart = useCallback(
    async (items) => {
      try {
        await AsyncStorage.setItem(cartKey, JSON.stringify(items));
      } catch (err) {
        console.warn("Failed to persist cart:", err);
      }
    },
    [cartKey]
  );

  // ── Add to Cart (mirrors web cartSlice.addToCart) ──
  const addToCart = useCallback(
    (product) => {
      setCartItems((prev) => {
        const isWeight = product.sellingType === "weight";
        const step = isWeight ? 0.25 : 1;
        const quantityToAdd = product.selectedQuantity
          ? Number(product.selectedQuantity)
          : step;

        const existingIdx = prev.findIndex((item) => item._id === product._id);
        let updated;

        if (existingIdx >= 0) {
          updated = prev.map((item, idx) =>
            idx === existingIdx
              ? {
                  ...item,
                  cartQuantity: Number(
                    (item.cartQuantity + quantityToAdd).toFixed(2)
                  ),
                }
              : item
          );
        } else {
          const tempProduct = { ...product, cartQuantity: quantityToAdd };
          delete tempProduct.selectedQuantity;
          updated = [...prev, tempProduct];
        }

        persistCart(updated);
        return updated;
      });
    },
    [persistCart]
  );

  // ── Remove from Cart ──
  const removeFromCart = useCallback(
    (product) => {
      setCartItems((prev) => {
        const updated = prev.filter((item) => item._id !== product._id);
        persistCart(updated);
        return updated;
      });
    },
    [persistCart]
  );

  // ── Decrease cart quantity (mirrors web cartSlice.decreaseCart) ──
  const decreaseCart = useCallback(
    (product) => {
      setCartItems((prev) => {
        const isWeight = product.sellingType === "weight";
        const step = isWeight ? 0.25 : 1;
        const minQty = isWeight ? 0.25 : 1;

        const idx = prev.findIndex((item) => item._id === product._id);
        if (idx === -1) return prev;

        let updated;
        if (prev[idx].cartQuantity > minQty) {
          updated = prev.map((item, i) =>
            i === idx
              ? {
                  ...item,
                  cartQuantity: Number(
                    (item.cartQuantity - step).toFixed(2)
                  ),
                }
              : item
          );
        } else {
          // Remove item if at minimum
          updated = prev.filter((item) => item._id !== product._id);
        }

        persistCart(updated);
        return updated;
      });
    },
    [persistCart]
  );

  // ── Update specific quantity ──
  const updateQuantity = useCallback(
    (productId, quantity) => {
      setCartItems((prev) => {
        const idx = prev.findIndex((item) => item._id === productId);
        if (idx === -1) return prev;

        const item = prev[idx];
        const isWeight = item.sellingType === "weight";
        const minQty = isWeight ? 0.25 : 1;

        let validQty = Number(quantity);
        if (isNaN(validQty) || validQty < minQty) validQty = minQty;

        const updated = prev.map((it, i) =>
          i === idx
            ? { ...it, cartQuantity: Number(validQty.toFixed(2)) }
            : it
        );

        persistCart(updated);
        return updated;
      });
    },
    [persistCart]
  );

  // ── Clear Cart ──
  const clearCart = useCallback(() => {
    setCartItems([]);
    persistCart([]);
  }, [persistCart]);

  // ── Computed totals ──
  const totals = useMemo(() => calculateTotals(cartItems), [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotalQuantity: totals.cartTotalQuantity,
        cartTotalAmount: totals.cartTotalAmount,
        addToCart,
        removeFromCart,
        decreaseCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
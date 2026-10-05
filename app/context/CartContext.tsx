"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

type CartItem = {
  name: string;
  price: string;
  image: string;
  quantity: number;
  stock: number;
};

type CartProduct = {
  name: string;
  price: string;
  image: string;
  stock: number;
};

type CartContextType = {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;

  isCartOpen: boolean;
  setIsCartOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;

  isCheckoutOpen: boolean;
  setIsCheckoutOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;

  addToCart: (product: CartProduct) => void;

  increaseQuantity: (productName: string) => void;
  decreaseQuantity: (productName: string) => void;
  removeFromCart: (productName: string) => void;

  setCartItems: React.Dispatch<
    React.SetStateAction<CartItem[]>
  >;
};

const CartContext = createContext<
  CartContextType | undefined
>(undefined);


export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [isCheckoutOpen, setIsCheckoutOpen] =
  useState(false);

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cartItems.reduce(
  (total, item) => {
    const priceNumber = Number(
      item.price.replace(/[^\d]/g, "")
    );

    return total + priceNumber * item.quantity;
  },
  0
);

  const addToCart = (product: CartProduct) => {
    if (product.stock <= 0) {
      alert("Produk sedang habis.");
      return;
    }

    setCartItems((items) => {
      const existingItem = items.find(
        (item) => item.name === product.name
      );

      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          alert(
            "Jumlah produk sudah mencapai stok yang tersedia."
          );

          return items;
        }

        return items.map((item) =>
          item.name === product.name
            ? {
                ...item,
                quantity: item.quantity + 1,
                stock: product.stock,
              }
            : item
        );
      }

      return [
        ...items,
        {
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
          stock: product.stock,
        },
      ];
    });
  };

  const increaseQuantity = (
    productName: string
  ) => {
    setCartItems((items) =>
      items.map((item) => {
        if (item.name !== productName) {
          return item;
        }

        if (item.quantity >= item.stock) {
          alert(
            "Jumlah produk sudah mencapai stok yang tersedia."
          );

          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      })
    );
  };

  const decreaseQuantity = (
    productName: string
  ) => {
    setCartItems((items) =>
      items
        .map((item) =>
          item.name === productName
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (
    productName: string
  ) => {
    setCartItems((items) =>
      items.filter(
        (item) => item.name !== productName
      )
    );
  };

   return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,

        isCartOpen,
        setIsCartOpen,

        isCheckoutOpen,
        setIsCheckoutOpen,

        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        setCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart harus digunakan di dalam CartProvider"
    );
  }

  return context;
}
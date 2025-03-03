export interface ProductListParams {
    _id: string;
    images: [string];
    name: string;
    price: number;
    oldPrice?: number;
    color?: string;
    size?: string;
    description?: string;
    quantity: number;
    inStock?: boolean;
    isFeatured?: boolean;
    category?: string;
}

export interface CartItem {
    cart: ProductListParams[];
}

export interface CartState {
    cart: {
        cart: ProductListParams[];
        length: number;
    }
}

export interface IUserForm {
    label: string;
    labelColor: string;
    duration: number;
    text: string;
    updateText: (text: string) => void;
    keyboardType?: string;
    isPasswordField?: boolean;
    error?: string;
}
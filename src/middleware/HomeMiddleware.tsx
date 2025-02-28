import axios from 'axios';
import { ProductListParams, CategoryParams } from '../TypesCheck/HomeProp';
import { Platform } from 'react-native';

interface ICatProps {
    setGetCategory: React.Dispatch<React.SetStateAction<CategoryParams[]>>;
}

interface IProdByCatProps {
    setGetProductsByCatID: React.Dispatch<React.SetStateAction<ProductListParams[]>>;
    catID: string;
}

interface IFilterProps {
    setGetProductsByCatID: React.Dispatch<React.SetStateAction<ProductListParams[]>>;
    maxPrice?: number;
}


export const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;

    // Replace localhost with your PC's IP address for Android
    const IP_ADDRESS = '10.106.20.124'; // Update this with your PC's IP address

    if (Platform.OS === 'android') {
        if (imagePath.startsWith('http')) {
            return imagePath.replace('localhost:9000', `${IP_ADDRESS}:9000`);
        }
        return `http://${IP_ADDRESS}:9000/assets/${imagePath}`;
    }

    // For iOS or web, use localhost
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    return `http://localhost:9000/assets/${imagePath}`;
};

// Update BASE_URL as well
const BASE_URL = Platform.OS === 'android'
    ? 'http://10.106.20.124:9000'
    : 'http://localhost:9000';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 5000, // 5 second timeout
    headers: {
        'Content-Type': 'application/json'
    }
});

export const fetchCategories = async ({ setGetCategory }: ICatProps) => {
    try {
        const response = await api.get('/category');
        console.log('Categories response:', response.data);
        if (response.data) {
            setGetCategory(response.data);
        }
    } catch (error: any) {
        console.error('Error fetching categories:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        throw error;
    }
};

export const fetchProductsByCatID = async ({ setGetProductsByCatID, catID }: IProdByCatProps): Promise<ProductListParams[]> => {
    try {
        let response;
        if (catID) {
            response = await api.get(`/product/category/${catID}`);
        } else {
            response = await api.get(`/product/getAllProducts`);
        }
        console.log('Products response:', response.data);
        if (response.data) {
            setGetProductsByCatID(response.data);
            return response.data;
        }
        return [];
    } catch (error: any) {
        console.error('Error fetching products:', error);
        setGetProductsByCatID([]);
        throw error;
    }
};

export const fetchProductsInStock = async ({ setGetProductsByCatID }: {
    setGetProductsByCatID: (products: ProductListParams[]) => void
}): Promise<ProductListParams[]> => {
    try {
        const response = await api.get('/product/inStock');
        if (response.data) {
            setGetProductsByCatID(response.data);
            return response.data;
        }
        return [];
    } catch (error: any) {
        console.error('Error fetching in-stock products:', error);
        setGetProductsByCatID([]);
        throw error;
    }
};

export const fetchProductsOutOfStock = async ({ setGetProductsByCatID }: {
    setGetProductsByCatID: (products: ProductListParams[]) => void
}): Promise<ProductListParams[]> => {
    try {
        const response = await api.get('/product/outOfStock');
        if (response.data) {
            setGetProductsByCatID(response.data);
            return response.data;
        }
        return [];
    } catch (error: any) {
        console.error('Error fetching out-of-stock products:', error);
        setGetProductsByCatID([]);
        throw error;
    }
};
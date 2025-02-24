import { View, Image, Text, Platform, ScrollView, Dimensions, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { RootStackScreenProps } from '../Navigation/RootNavigator'
import HeaderComponent from '../Components/HeaderComponents/HeaderComponent'
import { AntDesign, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'
import { getImageUrl } from '../middleware/HomeMiddleware'

const { width } = Dimensions.get('window')

const ProductDetails = ({ navigation, route }: RootStackScreenProps<'productDetails'>) => {
    const { _id, name, price, oldPrice, inStock, description, quantity, images } = route.params;
    const [isFavorite, setIsFavorite] = useState(false);
    const [itemQuantity, setItemQuantity] = useState(1);

    const goToPreviousScreen = () => {
        if (navigation.canGoBack()) {
            navigation.goBack()
        } else {
            navigation.navigate("OnboardingScreen")
        }
    }

    const goToCartScreen = () => {
        navigation.navigate('Cart');
    }

    const handleQuantityChange = (increment: boolean) => {
        setItemQuantity(prev => {
            if (increment) {
                return prev + 1;
            } else {
                return prev > 1 ? prev - 1 : 1;
            }
        });
    }

    return (
        <SafeAreaView style={styles.container}>
            <HeaderComponent gotoCartScreen={goToCartScreen} goToPrevios={goToPreviousScreen} />
            <ScrollView>
                {/* Image Section with Favorite Button */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{
                            uri: getImageUrl(images[0]) || undefined
                        }}
                        style={styles.productImage}
                        resizeMode="cover"
                        defaultSource={require('../../assets/cat404.jpg')}
                        onError={(e) => {
                            console.log('Image load error:', e.nativeEvent.error);
                        }}
                    />
                    <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={() => setIsFavorite(!isFavorite)}
                    >
                        <AntDesign
                            name={isFavorite ? "heart" : "hearto"}
                            size={24}
                            color={isFavorite ? "red" : "black"}
                        />
                    </TouchableOpacity>
                </View>

                {/* Product Info Section */}
                <View style={styles.infoContainer}>
                    <Text style={styles.productName}>{name}</Text>
                    <Text style={styles.description}>{description}</Text>

                    {/* Price Section */}
                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>${price}</Text>
                        {oldPrice && oldPrice > price && (
                            <Text style={styles.oldPrice}>${oldPrice}</Text>
                        )}
                    </View>

                    {/* Stock Status */}
                    <Text style={[
                        styles.stockStatus,
                        { color: inStock ? '#4CAF50' : '#F44336' }
                    ]}>
                        {inStock ? 'In Stock' : 'Out of Stock'}
                    </Text>

                    {/* Quantity Section */}
                    <View style={styles.quantityContainer}>
                        <Text style={styles.quantityLabel}>Quantity:</Text>
                        <View style={styles.quantityControls}>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => handleQuantityChange(false)}
                            >
                                <AntDesign name="minus" size={20} color="black" />
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{itemQuantity}</Text>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => handleQuantityChange(true)}
                            >
                                <AntDesign name="plus" size={20} color="black" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Delivery Section */}
                    <View style={styles.deliverySection}>
                        <View style={styles.deliveryHeader}>
                            <MaterialCommunityIcons name="truck-delivery-outline" size={24} color="#007AFF" />
                            <Text style={styles.deliveryTitle}>Delivery</Text>
                        </View>
                        <View style={styles.deliveryInfo}>
                            <Text style={styles.deliveryStatus}>Delivery is available</Text>
                            <View style={styles.addressContainer}>
                                <Text style={styles.deliveryLabel}>Delivery to:</Text>
                                <Text style={styles.deliveryAddress}>
                                    7/1 Đ. Thành Thái, Phường 14, Quận 10, Hồ Chí Minh 700000
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Add to Cart Button */}
            <TouchableOpacity
                style={[
                    styles.addToCartButton,
                    !inStock && styles.disabledButton
                ]}
                disabled={!inStock}
            >
                <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingTop: Platform.OS === "android" ? 20 : 0,
    },
    imageContainer: {
        width: '100%',
        height: width,
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    favoriteButton: {
        position: 'absolute',
        right: 20,
        top: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    infoContainer: {
        padding: 20,
    },
    productName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        lineHeight: 24,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007AFF',
        marginRight: 10,
    },
    oldPrice: {
        fontSize: 18,
        color: '#999',
        textDecorationLine: 'line-through',
    },
    stockStatus: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 20,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    quantityLabel: {
        fontSize: 16,
        marginRight: 15,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 25,
        padding: 5,
    },
    quantityButton: {
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 20,
    },
    quantityText: {
        fontSize: 18,
        fontWeight: '600',
        marginHorizontal: 20,
    },
    // New delivery styles
    deliverySection: {
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
    },
    deliveryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    deliveryTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginLeft: 10,
    },
    deliveryInfo: {
        marginLeft: 34,
    },
    deliveryStatus: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '500',
        marginBottom: 8,
    },
    addressContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    deliveryLabel: {
        fontSize: 14,
        color: '#666',
        marginRight: 5,
    },
    deliveryAddress: {
        fontSize: 14,
        color: '#333',
        flex: 1,
        lineHeight: 20,
    },
    addToCartButton: {
        backgroundColor: '#007AFF',
        padding: 20,
        margin: 20,
        borderRadius: 30,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#cccccc',
    },
    addToCartText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    }
});

export default ProductDetails;
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { ProductListParams, CategoryParams } from '../TypesCheck/HomeProp';
import {
  fetchCategories,
  fetchProductsByCatID,
  fetchProductsInStock,
  fetchProductsOutOfStock,
  getImageUrl
} from '../middleware/HomeMiddleware';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const [getCategory, setGetCategory] = useState<CategoryParams[]>([]);
  const [getProductsByCatID, setGetProductsByCatID] = useState<ProductListParams[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductListParams[]>([]);
  const [activeCat, setActiveCat] = useState("");
  const [activeStock, setActiveStock] = useState<boolean | null>(null);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const sliderImages = [
    require('../../assets/product1.jpg'),
    require('../../assets/product2.jpg'),
    require('../../assets/product3.jpg'),
  ];

  useEffect(() => {
    fetchCategories({ setGetCategory }).catch(error => {
      console.error('Error fetching categories:', error);
    });
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setIsProductLoading(true);
      try {
        let products;
        if (activeCat) {
          products = await fetchProductsByCatID({ setGetProductsByCatID, catID: activeCat });
        } else if (activeStock !== null) {
          if (activeStock) {
            products = await fetchProductsInStock({ setGetProductsByCatID });
          } else {
            products = await fetchProductsOutOfStock({ setGetProductsByCatID });
          }
        } else {
          products = await fetchProductsByCatID({ setGetProductsByCatID, catID: '' });
        }
        setFilteredProducts(products);
        setError(null);
      } catch (err) {
        setError('Failed to load products');
        console.error('Product loading error:', err);
      } finally {
        setIsProductLoading(false);
      }
    };
    loadProducts();
  }, [activeCat, activeStock]);

  const handleCategoryPress = (catId: string) => {
    setActiveCat(catId);
    setActiveStock(null);
  };

  const handleStockFilter = (inStock: boolean | null) => {
    if (activeStock === inStock) {
      setActiveStock(null);
      setFilteredProducts(getProductsByCatID);
    } else {
      setActiveStock(inStock);
      const filtered = getProductsByCatID.filter(product => product.inStock === inStock);
      setFilteredProducts(filtered);
    }
    setActiveCat("");
  };

  const renderSlideItem = ({ item }: { item: any }) => (
    <Image
      source={item}
      style={styles.slideImage}
      resizeMode="cover"
    />
  );

  const renderItem = ({ item }: { item: ProductListParams }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate("productDetails", {
        _id: item._id,
        name: item.name,
        images: [item.images[0]],
        price: item.price,
        oldPrice: item.oldPrice,
        inStock: item.inStock,
        description: item.description,
        quantity: 1
      })}
    >
      <Image
        source={{
          uri: getImageUrl(item.images[0]) || undefined
        }}
        style={styles.productImage}
        resizeMode="cover"
        defaultSource={require('../../assets/cat404.jpg')}
        onError={(e) => {
          console.log('Image load error:', e.nativeEvent.error);
        }}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>${item.price}</Text>
          {item.oldPrice > 0 && (
            <Text style={styles.oldPrice}>${item.oldPrice}</Text>
          )}
        </View>
        <Text style={[styles.stockStatus, item.inStock ? styles.inStockText : styles.outOfStockText]}>
          {item.inStock ? 'In Stock' : 'Out of Stock'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Slider */}
        <View style={styles.sliderContainer}>
          <FlatList
            data={sliderImages}
            renderItem={renderSlideItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const slideIndex = Math.floor(event.nativeEvent.contentOffset.x / width);
              setCurrentSlideIndex(slideIndex);
            }}
          />
          <View style={styles.pagination}>
            {sliderImages.map((_, index) => (
              <View
                key={index}
                style={[styles.paginationDot, currentSlideIndex === index && styles.paginationDotActive]}
              />
            ))}
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.categoryButton, activeCat === "" && activeStock === null && styles.activeCategory]}
              onPress={() => {
                setActiveCat("");
                setActiveStock(null);
              }}
            >
              <Text style={[styles.categoryText, activeCat === "" && activeStock === null && styles.activeText]}>
                All ({getProductsByCatID.length})
              </Text>
            </TouchableOpacity>
            {getCategory.map((category) => (
              <TouchableOpacity
                key={category._id}
                style={[styles.categoryButton, activeCat === category._id && styles.activeCategory]}
                onPress={() => handleCategoryPress(category._id)}
              >
                <Text style={[styles.categoryText, activeCat === category._id && styles.activeText]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stock Filter */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, activeStock === true && styles.activeFilter]}
              onPress={() => handleStockFilter(true)}
            >
              <Text style={[styles.filterText, activeStock === true && styles.activeText]}>
                In Stock ({getProductsByCatID.filter(p => p.inStock).length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, activeStock === false && styles.activeFilter]}
              onPress={() => handleStockFilter(false)}
            >
              <Text style={[styles.filterText, activeStock === false && styles.activeText]}>
                Out of Stock ({getProductsByCatID.filter(p => !p.inStock).length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Products Grid */}
        <View style={styles.productsContainer}>
          <Text style={styles.sectionTitle}>
            Products ({filteredProducts.length})
          </Text>
          {isProductLoading ? (
            <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <View style={styles.productGrid}>
              {filteredProducts.map((item) => (
                <View key={item._id} style={styles.productWrapper}>
                  {renderItem({ item })}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sliderContainer: {
    height: 200,
    position: 'relative',
  },
  slideImage: {
    width: width,
    height: 200,
  },
  pagination: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginHorizontal: 4,
    opacity: 0.5,
  },
  paginationDotActive: {
    opacity: 1,
  },
  sectionContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeCategory: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    color: '#333',
    fontSize: 14,
  },
  filterText: {
    color: '#333',
    fontSize: 14,
  },
  activeText: {
    color: '#fff',
  },
  productWrapper: {
    width: '50%',
    padding: 8,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    flex: 1,
  },
  productImage: {
    width: '100%',
    aspectRatio: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    height: 40,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 8,
  },
  oldPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  stockStatus: {
    fontSize: 12,
    fontWeight: '500',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  inStockText: {
    color: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  outOfStockText: {
    color: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -8,
  },
  productsContainer: {
    flex: 1,
    padding: 15,
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});
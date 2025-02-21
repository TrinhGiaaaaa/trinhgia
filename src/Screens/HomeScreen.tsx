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
import { fetchCategories, fetchProductsByCatID, fetchProductsByStock } from '../middleware/HomeMiddleware';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const [getCategory, setGetCategory] = useState<CategoryParams[]>([]);
  const [getProductsByCatID, setGetProductsByCatID] = useState<ProductListParams[]>([]);
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
        if (activeCat) {
          await fetchProductsByCatID({ setGetProductsByCatID, catID: activeCat });
        } else if (activeStock !== null) {
          await fetchProductsByStock({ setGetProductsByCatID, inStock: activeStock });
        } else {
          await fetchProductsByCatID({ setGetProductsByCatID, catID: '' });
        }
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
    setActiveStock(inStock);
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
      onPress={() => navigation.navigate("ProductDetail", { product: item })}
    >
      <Image
        source={{
          uri: item.images[0].replace(
            "localhost:9000",
            Platform.OS === "android" ? "10.106.23.56:9000" : "localhost:9000"
          ),
        }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price}</Text>
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
              const slideIndex = Math.floor(
                event.nativeEvent.contentOffset.x / width
              );
              setCurrentSlideIndex(slideIndex);
            }}
          />
          <View style={styles.pagination}>
            {sliderImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  currentSlideIndex === index && styles.paginationDotActive,
                ]}
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
                All
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
                In Stock
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, activeStock === false && styles.activeFilter]}
              onPress={() => handleStockFilter(false)}
            >
              <Text style={[styles.filterText, activeStock === false && styles.activeText]}>
                Out of Stock
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Products Grid */}
        <View style={styles.productsContainer}>
          <Text style={styles.sectionTitle}>Products</Text>
          {isProductLoading ? (
            <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <View style={styles.productGrid}>
              {getProductsByCatID.map((item) => (
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
  productsContainer: {
    padding: 15,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  productWrapper: {
    width: '50%',
    padding: 5,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
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
import {
  View,
  Text,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ActivityIndicator
} from 'react-native'
import React, { useContext, useEffect } from 'react'
import { TabsStackScreenProps } from '../Navigation/TabsNavigation'
import { SafeAreaView } from 'react-native-safe-area-context'
import HeadersComponent from '../Components/HeaderComponents/HeaderComponent'
import DisplayMessage from '../Components/ProductDetails/DisplayMessage'
import { useSelector, useDispatch } from 'react-redux'
import { CartState, ProductListParams } from '../TypesCheck/productCartTypes'
import { getImageUrl } from '../middleware/HomeMiddleware'
import { AntDesign, Feather } from '@expo/vector-icons'
import { removeFromCart, increaseQuantity, decreaseQuantity } from '../redux/CartReducer'
import { UserType } from '../Components/LoginRegisterComponents/UserContext'

const CartScreen = ({ navigation, route }: TabsStackScreenProps<"Cart">) => {
  const cart = useSelector((state: CartState) => state.cart.cart);
  const [message, setMessage] = React.useState("");
  const [displayMessage, setDisplayMessage] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const dispatch = useDispatch();
  const { getUserId } = useContext(UserType);

  // Thêm console.log để debug
  useEffect(() => {
    console.log("Cart in CartScreen:", cart);
    console.log("Cart type:", typeof cart);
    console.log("Cart length:", cart ? cart.length : 0);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [cart]);

  const handleDeleteItem = (itemId: string) => {
    console.log("Removing item with ID:", itemId);
    dispatch(removeFromCart(itemId));
    setMessage("Đã xóa sản phẩm khỏi giỏ hàng");
    setDisplayMessage(true);
    setTimeout(() => {
      setDisplayMessage(false);
    }, 3000);
  };

  const handleIncreaseQuantity = (item: ProductListParams) => {
    dispatch(increaseQuantity(item));
  };

  const handleDecreaseQuantity = (item: ProductListParams) => {
    if (item.quantity && item.quantity > 1) {
      dispatch(decreaseQuantity(item));
    }
  };

  const goToPreviousScreen = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Home");
    }
  };

  const proceed = () => {
    if (getUserId === "") {
      navigation.navigate("UserLogin", { screenTitle: "User Authentication" });
    } else {
      if (!cart || cart.length === 0) {
        navigation.navigate("TabsStack", { screen: "Home" });
      } else {
        navigation.navigate("Payment");
      }
    }
  };

  const gotoCartScreen = () => {
    // Không cần điều hướng vì đã ở trong CartScreen
    if (!cart || cart.length === 0) {
      setMessage("Giỏ hàng trống. Vui lòng thêm sản phẩm.");
      setDisplayMessage(true);
      setTimeout(() => {
        setDisplayMessage(false);
      }, 3000);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <HeadersComponent gotoCartScreen={gotoCartScreen} cartLength={cart ? cart.length : 0} goToPrevios={goToPreviousScreen} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2ECC71" />
          <Text style={{ marginTop: 10, color: '#666' }}>Đang tải giỏ hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {displayMessage && <DisplayMessage message={message} visible={() => setDisplayMessage(!displayMessage)} />}
      <HeadersComponent gotoCartScreen={gotoCartScreen} cartLength={cart ? cart.length : 0} goToPrevios={goToPreviousScreen} />

      {!cart || cart.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Feather name="shopping-cart" size={64} color="#ccc" />
          <Text style={styles.emptyCartText}>Giỏ hàng của bạn đang trống</Text>
          <TouchableOpacity
            style={styles.continueShoppingButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.continueShoppingText}>Tiếp tục mua sắm</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.cartContainer}>
          {cart.map((item, index) => (
            <View key={index} style={styles.cartItem}>
              <Image
                source={{
                  uri: getImageUrl(item.images?.[0]) || undefined
                }}
                style={styles.itemImage}
                defaultSource={require('../../assets/cat404.jpg')}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>${item.price}</Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleDecreaseQuantity(item)}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityValue}>{item.quantity || 1}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleIncreaseQuantity(item)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteItem(item._id)}
              >
                <AntDesign name="delete" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Tổng cộng:</Text>
            <Text style={styles.totalAmount}>
              ${cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0).toFixed(2)}
            </Text>
          </View>

          <Pressable
            onPress={proceed}
            style={styles.checkoutButton}
          >
            <Text style={styles.checkoutButtonText}>Tiến hành thanh toán</Text>
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === "android" ? 20 : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
  },
  continueShoppingButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#2ECC71',
    borderRadius: 10,
  },
  continueShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartContainer: {
    flex: 1,
    padding: 15,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemPrice: {
    fontSize: 16,
    color: '#2ECC71',
    fontWeight: 'bold',
    marginTop: 5,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  quantityText: {
    fontSize: 14,
    color: '#666',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2ECC71',
  },
  checkoutButton: {
    backgroundColor: '#2ECC71',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  quantityButton: {
    padding: 8,
    backgroundColor: '#f5f5f5',
  },
  quantityValue: {
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#333',
  },
});

export default CartScreen;
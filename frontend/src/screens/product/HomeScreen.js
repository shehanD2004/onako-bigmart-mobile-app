import { View, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { getProducts } from "../../api/productApi";
import ProductCard from "../../components/ProductCard";

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then(res => setProducts(res.data));
  }, []);

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <ProductCard
          item={item}
          onPress={() => navigation.navigate("Details", { id: item._id })}
        />
      )}
    />
  );
}
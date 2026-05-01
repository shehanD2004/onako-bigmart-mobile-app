import { View, Text, Image, TouchableOpacity } from "react-native";

// Component for displaying a single product in a card layout
export default function ProductCard({ item, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View>
        <Image source={{ uri: item.image }} style={{ height: 100 }} />
        <Text>{item.name}</Text>
        <Text>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );
}
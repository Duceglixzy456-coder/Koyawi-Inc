export default function ConfirmSaleScreen({ route, navigation }) {
  const { listing_id, conversation_id, buyer_id } = route.params;
  const { token } = useAuth();

  const handleConfirm = async () => {
    try {
      const res = await fetch(
        `http://192.168.1.194:8000/listings/${listing_id}/mark-sold`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversation_id,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.log("SOLD ERROR:", data);
        return;
      }

      Alert.alert("Success", "Listing marked as sold");

      // go back to main
      navigation.popToTop();
    } catch (err) {
      console.log("CONFIRM ERROR:", err);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 20 }}>
        Confirm Sale
      </Text>

      <Text>Buyer ID: {buyer_id}</Text>

      <TouchableOpacity
        onPress={handleConfirm}
        style={{
          marginTop: 20,
          backgroundColor: "black",
          padding: 15,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Confirm Mark as Sold
        </Text>
      </TouchableOpacity>
    </View>
  );
}
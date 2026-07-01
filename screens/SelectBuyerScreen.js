export default function SelectBuyerScreen({ route, navigation }) {
  const { listing_id } = route.params;

  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch(
        `http://192.168.1.194:8000/conversations/listing/${listing_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBuyer = (conversation) => {
    navigation.navigate("ConfirmSaleScreen", {
      listing_id,
      conversation_id: conversation._id,
      buyer_id: conversation.buyer_id,
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!conversations.length) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Aucun acheteur pour cette annonce</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={{
            padding: 15,
            borderBottomWidth: 1,
            borderColor: "#eee",
          }}
          onPress={() => handleSelectBuyer(item)}
        >
          <Text style={{ fontWeight: "700" }}>
            Buyer: {item.buyer_id}
          </Text>

          <Text style={{ color: "#666", marginTop: 4 }}>
            {item.last_message || "No messages"}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}
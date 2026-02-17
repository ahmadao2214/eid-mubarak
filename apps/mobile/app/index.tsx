import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-eid-dark">
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-5xl font-bold text-eid-gold text-center mb-2">
          Eid Mubarak!
        </Text>
        <Text className="text-lg text-gray-300 text-center mb-12">
          Create cheesy Eid video cards with maximum aunty energy
        </Text>
        <Pressable
          onPress={() => router.push("/create/step1")}
          className="bg-eid-gold px-8 py-4 rounded-xl active:bg-yellow-400"
        >
          <Text className="text-lg font-bold text-eid-dark">
            Create a Card
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

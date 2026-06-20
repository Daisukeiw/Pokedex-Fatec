import { Stack, Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "@/context/AuthContext";
import { Colors } from "@/constants/colors";

// Define o dashboard como a rota PADRÃO do grupo (app). Sem isso, o Expo Router
// usa a primeira rota em ordem alfabética ('battle') como padrão no celular.
export const unstable_settings = {
    initialRouteName: "dashboard",
};

export default function AppLayout() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color={Colors.black} />
            </View>
        );
    }

    if (!isAuthenticated) {
        return <Redirect href="/" />;
    }

    return <Stack screenOptions={{headerShown: false}} />;
}
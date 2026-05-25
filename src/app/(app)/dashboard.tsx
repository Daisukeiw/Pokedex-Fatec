import { View, Text, StyleSheet, Platform, ImageBackground } from 'react-native';
import { Header } from '@/components/header';
import { useAuth } from '@/context/AuthContext';
import BackgroundImage from '@assets/images/background.png';

const isWeb = Platform.OS === 'web';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <ImageBackground
      source={BackgroundImage}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay} />

      <View style={styles.wrapper}>
        <Header title="Dashboard" />

        <View style={styles.container}>
          <View style={styles.heroBox}>
            <Text style={styles.title}>Bem-vindo, Mestre Pokémon</Text>
            <Text style={styles.userName}>{user}</Text>
            <Text style={styles.subtitle}>
              Use o menu para acessar sua Pokédex e explorar os Pokémon.
            </Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
    background: {
      flex: 1,
    },
    backgroundImage: {
      resizeMode: 'cover',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255,255,255,0.10)',
    },
    wrapper: {
      flex: 1,
    },
    container: {
      flex: 1,
      padding: isWeb ? 48 : 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    heroBox: {
      width: '100%',
      maxWidth: 520,
      backgroundColor: 'rgba(255,255,255,0.72)',
      borderRadius: 20,
      padding: isWeb ? 32 : 24,
      gap: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.65)',
    },
    title: {
      color: '#0F172A',
      fontSize: isWeb ? 28 : 22,
      fontWeight: '900',
      textAlign: 'center',
    },
    userName: {
      color: '#1E293B',
      fontSize: isWeb ? 34 : 28,
      fontWeight: '900',
      textAlign: 'center',
    },
    subtitle: {
      color: '#334155',
      fontSize: isWeb ? 16 : 14,
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: 22,
    },
  });
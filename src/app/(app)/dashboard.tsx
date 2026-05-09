import { View, Text, StyleSheet, ImageBackground, Platform } from 'react-native';
import { Button } from '@/components/button';
import { List } from '@/components/list';
import { PokemonCard, PokemonCardData } from '@/components/pokemon-card';
import BackgroundWeb from '@assets/images/background.png';
import BackgroundMobile2 from '@assets/images/backgroundMobile2.jpg';

import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
    const { user, signOut } = useAuth();

    // Mock local: estrutura já compatível com o tipo do card e com retorno de API.
    // Pedi ajuda pra IA pra conseguir puxar os sprites do pokemon direto da api.
    const pokemons: PokemonCardData[] = [
        {
            id: 937,
            name: 'Ceruledge',
            imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/937.png',
            types: ['fire', 'ghost'],
            height: 1.6,
            weight: 62.0,
            ability: 'Flash Fire',
            stats: { hp: 75, attack: 125, defense: 80, SpecialAttack: 60, SpecialDefense: 100, Speed: 85 },
        },
        {
            id: 644,
            name: 'Zekrom',
            imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/644.png',
            types: ['dragon', 'electric'],
            height: 2.9,
            weight: 345.0,
            ability: 'Teravolt',
            stats: { hp: 100, attack: 150, defense: 120, SpecialAttack: 120, SpecialDefense: 100, Speed: 90 },
        },
        {
            id: 643,
            name: 'Reshiram',
            imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/643.png',
            types: ['dragon', 'fire'],
            height: 0.5,
            weight: 9.0,
            ability: 'Turboblaze',
            stats: { hp: 100, attack: 150, defense: 110, SpecialAttack: 125, SpecialDefense: 95, Speed: 95 },
        },
        {
            id: 150,
            name: 'Mewtwo',
            imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png',
            types: ['psychic'],
            height: 2.0,
            weight: 122.0,
            ability: 'Pressure',
            stats: { hp: 106, attack: 110, defense: 90, SpecialAttack: 154, SpecialDefense: 90, Speed: 130 },
        },

    ];

    return (
        <ImageBackground
            // Fundo diferente para web e mobile.
            source={Platform.OS === 'web' ? BackgroundWeb : BackgroundMobile2}
            style={styles.background}
            imageStyle={[
                styles.backgroundImage,
                // Ajuste de centralização específico do navegador.
                Platform.OS === 'web' && styles.backgroundImageWeb,
            ]}
        >
        {/* Overlay para dar contraste sobre a imagem de fundo. */}
        <View style={styles.overlay} />
        <View style={styles.container}>
            <Text style={styles.title}>Bem-vindo, Mestre Pokemon</Text>
            <Text style={styles.userName}>{user}</Text>


            <List
                // Componente genérico de lista para facilitar paginação/infinite scroll depois.
                data={pokemons}
                onLoadMore={() => {}}
                // Cada item da lista renderiza um card de Pokémon já tipado.
                renderItemContent={(item) => <PokemonCard pokemon={item} />}
            />
            <Button title="Sair da APP" onPress={signOut} style={{ marginTop: 20 }}/>
        </View>
        </ImageBackground>
    )
}

export const styles = StyleSheet.create({
    // Wrapper da tela inteira com background.
    background: {
        flex: 1,
    },
    // Mantém imagem preenchendo o espaço sem distorcer.
    backgroundImage: {
        resizeMode: 'cover',
    },
    // Ajuste do elemento img no web para centralizar corretamente.
    backgroundImageWeb: {
        width: '100%',
        height: '100%',
        objectPosition: 'center',
    } as any,
    // Área de conteúdo principal.
    container: {
        flex: 1,
        padding: 32,
        justifyContent: 'center',
        gap: 16,
    },
    // Escurece levemente o fundo para não competir com o conteúdo.
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
    },
    title: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '800',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.45)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
    userName: {
        color: '#FDE047',
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
        marginTop: -6,
        marginBottom: 6,
        textShadowColor: 'rgba(0, 0, 0, 0.45)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
});

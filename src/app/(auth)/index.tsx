import { useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

import Logo from '@assets/images/pokemon-icone.svg';
import BackgroundWeb from '@assets/images/background.png';
import BackgroundMobile2 from '@assets/images/backgroundMobile2.jpg';

import { View, Text, StyleSheet, ImageBackground, Platform } from 'react-native';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Card } from '@/components/card';
import { Alert } from '@/components/alert';   
import { Icon } from '@/components/icon';

export default function Index() {
    // Estados do formulário de login (mockados por enquanto).
    const [name, setName] = useState<string>('');
    const [senha, setSenha] = useState<string>('');

    // Controle do alerta reutilizável para feedback de erro/sucesso.
    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const [alertData, setAlertData] = useState({ 
        title: '', 
        message: '',
        type: 'success' as 'success' | 'error' | 'warning' | 'info',
    });

    const { signIn } = useAuth();

    function validateCredentials() {
        // Validação local temporária.
        if(name === 'kleber' && senha === '123') {
            // Atualiza o contexto global de autenticação.
            signIn(name);

            // Navega para dashboard já autenticado.
            router.push({
                pathname: '/dashboard',
                params: { username: name } 
            });
        } else {
            // Exibe alerta padronizado em caso de credenciais inválidas.
            setAlertData({
                title: 'Erro de Login',
                message: 'Credenciais inválidas. Tente novamente.',
                type: 'error',
            });
            setIsAlertVisible(true);
        }
    }

    return (
        <ImageBackground
            // Troca o background de acordo com a plataforma.
            source={Platform.OS === 'web' ? BackgroundWeb : BackgroundMobile2}
            style={styles.background}
            imageStyle={[
                styles.backgroundImage,
                // Ajustes extras para web evitam "corte" lateral no navegador.
                Platform.OS === 'web' && styles.backgroundImageWeb,
            ]}
        >
            {/* Overlay para melhorar contraste e legibilidade do conteúdo. */}
            <View style={styles.overlay} />
            <View style={styles.container}>
                {/* Card central do login com largura fluida e limite máximo. */}
                <Card style={styles.card}>
                    <Icon name={Logo} size={100} />
                    <Text style={styles.title}>Pokedex</Text>
                    <Input 
                        placeholder="Usuario" 
                        onChangeText={setName} />
                    <Input 
                        placeholder="Senha" 
                        secureTextEntry 
                        onChangeText={setSenha} />
                    <Button 
                        title="Enviar" 
                        onPress={validateCredentials} 
                        style={{ marginTop: 10 }}/>
                </Card>

                <Alert 
                    title={alertData.title}
                    message={alertData.message}
                    type={alertData.type}
                    visible={isAlertVisible}
                    onClose={() => setIsAlertVisible(false)}/>
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    // Garante que o wrapper do background ocupe toda a tela.
    background: {
        flex: 1,
    },
    // "cover" mantém preenchimento total no mobile sem distorcer imagem.
    backgroundImage: {
        resizeMode: 'cover',
    },
    // No web, forçamos posicionamento central da imagem renderizada.
    backgroundImageWeb: {
        width: '100%',
        height: '100%',
        objectPosition: 'center',
    } as any,
    // Camada escura translúcida para melhorar leitura dos elementos.
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },
    container: {
        flex: 1,
        // Percentual deixa o conteúdo mais adaptável em diferentes larguras de tela.
        paddingHorizontal: '8%',
        paddingVertical: 24,
        justifyContent: 'center',
        gap: 16,
    },
    card: {
        // Card com aparência mais premium para destacar formulário de login.
        width: '90%',
        maxWidth: 420,
        alignSelf: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.7)',
        paddingVertical: 22,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
        elevation: 10,
    },
    title: {
        color: '#B91C1C',
        fontSize: 30,
        fontWeight: '900',
        marginBottom: 18,
        textAlign: 'center',
        fontFamily: 'Pokemon Classic',
    },
});

import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import {
    View,
    Text,
    StyleSheet,
    Platform,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    ScrollView,
    useWindowDimensions,
} from 'react-native';
 
import { Pokeball } from '@/components/pokeball';
import { ThemedInput } from '@/components/themed-input/index';
import { Alert } from '@/components/alert';
import { Colors } from '@/constants/colors';
 
const isWeb = Platform.OS === 'web';
 
export default function Register() {
    // Estados do formulário de cadastro (funcionalidade original mantida).
    const [name, setName] = useState<string>('');
    const [senha, setSenha] = useState<string>('');
    const [confirmarSenha, setConfirmarSenha] = useState<string>('');
 
    // Controle do alerta reutilizável para feedback de erro/sucesso.
    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const [alertData, setAlertData] = useState({
        title: '',
        message: '',
        type: 'success' as 'success' | 'error' | 'warning' | 'info',
    });
 
    const { signUp } = useAuth();
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 420;
 
    const senhaRef = useRef<TextInput>(null);
    const confirmarRef = useRef<TextInput>(null);
 
    async function handleCreateAccount() {
        // Validações simples de formulário.
        if (!name.trim() || !senha.trim()) {
            setAlertData({
                title: 'Campos obrigatórios',
                message: 'Preencha o nome e a senha para continuar.',
                type: 'warning',
            });
            setIsAlertVisible(true);
            return;
        }
 
        if (senha !== confirmarSenha) {
            setAlertData({
                title: 'Senhas diferentes',
                message: 'A senha e a confirmação precisam ser iguais.',
                type: 'error',
            });
            setIsAlertVisible(true);
            return;
        }
 
        // Cadastra o usuário via API (AuthContext.signUp).
        const success = await signUp(name, senha);
 
        if (success) {
            setAlertData({
                title: 'Conta criada!',
                message: 'Sua conta foi criada com sucesso. Faça login para continuar.',
                type: 'success',
            });
            setIsAlertVisible(true);
 
            // Pequeno delay para o usuário ver o alerta antes de voltar ao login.
            setTimeout(() => {
                router.replace('/');
            }, 1200);
        } else {
            setAlertData({
                title: 'Usuário já existe',
                message: 'Já existe uma conta com esse nome. Escolha outro.',
                type: 'error',
            });
            setIsAlertVisible(true);
        }
    }
 
    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
        >
            {/* Linhas de fundo (grid sutil) */}
            <View style={styles.bgLineH} />
            <View style={styles.bgLineV} />
 
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.centered}>
                    {/* Cabeçalho com eyebrow + logo */}
                    <View style={styles.header}>
                        <View style={styles.eyebrow}>
                            <View style={styles.eyebrowLine} />
                            <Text style={styles.eyebrowText}>REGISTRO DE TREINADOR</Text>
                            <View style={styles.eyebrowLine} />
                        </View>
 
                        <View style={styles.logoRow}>
                            <Pokeball size={isWeb ? 32 : 26} />
                            <Text style={styles.logoText}>PokeBattle</Text>
                        </View>
 
                        <Text style={styles.subtitle}>Crie sua conta para começar</Text>
                    </View>
 
                    {/* Card de cadastro */}
                    <View
                        style={[
                            styles.card,
                            { width: isSmallScreen ? '100%' : '92%', maxWidth: 440 },
                        ]}
                    >
                        <View style={styles.cardTopAccent} />
 
                        <Text style={styles.cardTitle}>Criar Conta</Text>
 
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Nome do treinador</Text>
                            <ThemedInput
                                value={name}
                                onChangeText={setName}
                                autoCorrect={false}
                                returnKeyType="next"
                                blurOnSubmit={false}
                                onSubmitEditing={() => senhaRef.current?.focus()}
                            />
                        </View>
 
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Senha</Text>
                            <ThemedInput
                                ref={senhaRef}
                                value={senha}
                                onChangeText={setSenha}
                                secureTextEntry
                                returnKeyType="next"
                                blurOnSubmit={false}
                                onSubmitEditing={() => confirmarRef.current?.focus()}
                            />
                        </View>
 
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Confirmar senha</Text>
                            <ThemedInput
                                ref={confirmarRef}
                                value={confirmarSenha}
                                onChangeText={setConfirmarSenha}
                                secureTextEntry
                                returnKeyType="done"
                                onSubmitEditing={handleCreateAccount}
                            />
                        </View>
 
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleCreateAccount}
                            activeOpacity={0.85}
                            accessibilityRole="button"
                        >
                            <Text style={styles.buttonText}>CADASTRAR</Text>
                        </TouchableOpacity>
 
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>ou</Text>
                            <View style={styles.dividerLine} />
                        </View>
 
                        <View style={styles.loginRow}>
                            <Text style={styles.loginText}>Já tem conta? </Text>
                            <Text style={styles.loginLink} onPress={() => router.back()}>
                                Fazer login
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
 
            <Alert
                title={alertData.title}
                message={alertData.message}
                type={alertData.type}
                visible={isAlertVisible}
                onClose={() => setIsAlertVisible(false)}
            />
        </KeyboardAvoidingView>
    );
}
 
const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.dark.deepBg },
    scrollContent: { flexGrow: 1, justifyContent: 'center' },
 
    bgLineH: {
        ...StyleSheet.absoluteFillObject,
        top: '38%', bottom: undefined, height: 1,
        backgroundColor: Colors.whiteAlpha['05'],
    },
    bgLineV: {
        ...StyleSheet.absoluteFillObject,
        left: '50%', right: undefined, width: 1,
        backgroundColor: Colors.whiteAlpha['05'],
    },
 
    centered: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
        paddingHorizontal: isWeb ? 32 : 20, paddingVertical: 24, gap: 24,
    },
 
    header: { alignItems: 'center', gap: 10, width: '100%', maxWidth: 440 },
    eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 },
    eyebrowLine: { flex: 1, height: 1, backgroundColor: Colors.gold.base, maxWidth: 40, opacity: 0.6 },
    eyebrowText: { color: Colors.gold.base, fontSize: 9, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase' },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    logoText: { color: Colors.white, fontSize: isWeb ? 28 : 22, fontWeight: '900', letterSpacing: 3, textTransform: 'uppercase' },
    subtitle: {
        color: Colors.whiteAlpha['35'], fontSize: isWeb ? 11 : 10, textAlign: 'center',
        lineHeight: 18, maxWidth: 280, textTransform: 'uppercase', letterSpacing: 2,
    },
 
    card: {
        backgroundColor: Colors.dark.card,
        borderRadius: 2, borderWidth: 1, borderColor: Colors.dark.border,
        padding: isWeb ? 28 : 22, gap: 16, overflow: 'hidden',
        ...Platform.select({
            web: { boxShadow: '0 0 0 1px rgba(200,169,110,0.06), 0 20px 64px rgba(0,0,0,0.6)' } as any,
            default: {
                shadowColor: Colors.black, shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.35, shadowRadius: 18, elevation: 10,
            },
        }),
    },
    cardTopAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: Colors.gold.base },
    cardTitle: { color: Colors.gold.base, fontSize: isWeb ? 11 : 10, fontWeight: '800', letterSpacing: 4, textTransform: 'uppercase', marginTop: 4 },
 
    fieldGroup: { gap: 6 },
    label: { color: Colors.whiteAlpha['45'], fontSize: 10, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
 
    button: {
        width: '100%', height: 52, marginTop: 4,
        backgroundColor: Colors.gold.base, borderRadius: 2,
        borderWidth: 1, borderColor: Colors.gold.light,
        justifyContent: 'center', alignItems: 'center',
        ...Platform.select({
            web: { boxShadow: '0 6px 20px rgba(0,0,0,0.40)' } as any,
            default: { shadowColor: Colors.black, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
        }),
    },
    buttonText: { color: Colors.dark.deepBg, fontSize: 14, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
 
    divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 2 },
    dividerLine: { flex: 1, height: 1, backgroundColor: Colors.dark.border },
    dividerText: { color: Colors.whiteAlpha['30'], fontSize: 11, letterSpacing: 1 },
 
    loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    loginText: { color: Colors.whiteAlpha['35'], fontSize: 12 },
    loginLink: { color: Colors.gold.base, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
});
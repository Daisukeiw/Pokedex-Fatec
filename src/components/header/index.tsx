import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    Platform,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Animated,
    Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { Pokeball } from '@/components/pokeball';
import { Colors } from '@/constants/colors';
 
const MENU_WIDTH = 260;
const isWeb = Platform.OS === 'web';
 
function HamburgerIcon({ color = Colors.txtPrimary }: { color?: string }) {
    return (
        <View style={{ gap: 5 }}>
            <View style={{ width: 22, height: 2, backgroundColor: color, borderRadius: 2 }} />
            <View style={{ width: 16, height: 2, backgroundColor: color, borderRadius: 2 }} />
            <View style={{ width: 22, height: 2, backgroundColor: color, borderRadius: 2 }} />
        </View>
    );
}
 
const size = Platform.OS === 'web' ? 28 : 22;
 
const MENU_ITEMS = [
    { label: 'Pokédex',      icon: () => <Pokeball size={size} />, route: '/(app)/dashboard'          as const },
    //{ label: 'Pokédex',     icon: '📖',                           route: '/(app)/pokedex'             as const },//
    { label: 'Meu Time',    icon: '⚔️',                           route: '/(app)/teampokemon'         as const },
    { label: 'Perfil',      icon: '👤',                           route: '/(app)/profiletreinador'    as const },
] as const;
 
type Props = {
    showGreeting?: boolean;
    variant?: 'light' | 'dark';
    right?: React.ReactNode;
};
 
export function Header({ showGreeting = false, variant = 'light', right }: Props) {
    const isDark = variant === 'dark';
    const { user, signOut } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [menuOpen, setMenuOpen] = useState(false);
    const slideAnim = useRef(new Animated.Value(MENU_WIDTH)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
 
    function openMenu() {
        setMenuOpen(true);
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
        ]).start();
    }
 
    function closeMenu(cb?: () => void) {
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: MENU_WIDTH, duration: 220, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]).start(() => {
            setMenuOpen(false);
            cb?.();
        });
    }
 
    function handleItem(route: string) {
        closeMenu(() => router.push(route as any));
    }
 
    function handleSignOut() {
        closeMenu(async () => {
            await signOut();
            router.replace('/');
        });
    }
 
    return (
        <>
            <View
                style={[
                    styles.header,
                    isDark && styles.headerDark,
                    { paddingTop: isWeb ? 28 : insets.top + 12 },
                ]}
            >
                {showGreeting ? (
                    <View style={styles.headerLeft}>
                        <Text style={[styles.welcomeLabel, isDark && styles.welcomeLabelDark]}>Olá,</Text>
                        <Text style={[styles.welcomeName, isDark && styles.welcomeNameDark]}>{user}</Text>
                    </View>
                ) : (
                    <View />
                )}
                <View style={styles.headerRight}>
                    {right}
                    <TouchableOpacity
                        onPress={openMenu}
                        style={[styles.menuBtn, isDark && styles.menuBtnDark]}
                        activeOpacity={0.7}
                    >
                        <HamburgerIcon color={isDark ? Colors.gold.base : Colors.txtPrimary} />
                    </TouchableOpacity>
                </View>
            </View>
 
            <Modal visible={menuOpen} transparent animationType="none" onRequestClose={() => closeMenu()} statusBarTranslucent>
                <Pressable style={StyleSheet.absoluteFill} onPress={() => closeMenu()}>
                    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
                </Pressable>
                <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
                    <View style={styles.drawerTopAccent} />
                    <View style={styles.drawerHeader}>
                        <Text style={styles.drawerTitle}>MENU</Text>
                        <TouchableOpacity onPress={() => closeMenu()} activeOpacity={0.7}>
                            <View style={styles.closeBtnBox}>
                                <Text style={styles.closeBtn}>✕</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.drawerDivider} />
                    <View style={styles.menuItems}>
                        {MENU_ITEMS.map((item) => (
                            <TouchableOpacity
                                key={item.label}
                                style={styles.menuItem}
                                onPress={() => handleItem(item.route)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.menuItemIconWrapper}>
                                    {typeof item.icon === 'function'
                                        ? item.icon()
                                        : <Text style={styles.menuItemIcon}>{item.icon}</Text>}
                                </View>
                                <Text style={styles.menuItemLabel}>{item.label}</Text>
                                <Text style={styles.menuItemArrow}>›</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.drawerDivider} />
                    <TouchableOpacity style={styles.signOutItem} onPress={handleSignOut} activeOpacity={0.7}>
                        <Text style={styles.menuItemIcon}>🚪</Text>
                        <Text style={styles.signOutLabel}>Sair</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Modal>
        </>
    );
}
 
const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: isWeb ? 28 : 20,
        paddingBottom: 8,
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[100],
    },
    headerDark: {
        backgroundColor: 'transparent',
        borderBottomWidth: 0,
    },
    headerLeft: { gap: 2 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    welcomeLabel: {
        color: Colors.gray[500],
        fontSize: isWeb ? 11 : 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    welcomeLabelDark: {
        color: Colors.gold.base,
        letterSpacing: 3,
        textTransform: 'uppercase',
    },
    welcomeName: {
        color: Colors.txtPrimary,
        fontSize: isWeb ? 20 : 17,
        fontWeight: '900',
    },
    welcomeNameDark: {
        color: Colors.white,
        fontSize: isWeb ? 24 : 20,
        letterSpacing: 1,
        textTransform: 'capitalize',
    },
    menuBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: Colors.gray[100],
    },
    menuBtnDark: {
        backgroundColor: 'transparent',
        borderRadius: 2,
        borderWidth: 1,
        borderColor: Colors.gold.alpha30,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.65)',
    },
    drawer: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: MENU_WIDTH,
        backgroundColor: Colors.dark.card,
        borderLeftWidth: 1,
        borderLeftColor: Colors.gold.alpha30,
        paddingTop: isWeb ? 28 : 56,
        paddingBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: -8, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 16,
    },
    drawerTopAccent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: Colors.gold.base,
    },
    drawerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    drawerTitle: {
        color: Colors.gold.base,
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 4,
    },
    closeBtnBox: {
        width: 28,
        height: 28,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: Colors.dark.border,
        backgroundColor: Colors.dark.deepBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtn: {
        color: Colors.whiteAlpha['55'],
        fontSize: 12,
        lineHeight: 14,
        fontWeight: '700',
    },
    drawerDivider: {
        height: 1,
        backgroundColor: Colors.dark.border,
        marginHorizontal: 24,
        marginVertical: 8,
    },
    menuItems: {
        paddingVertical: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        gap: 14,
    },
    menuItemIconWrapper: {
        width: 34,
        height: 34,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: Colors.gold.alpha30,
        backgroundColor: Colors.dark.deepBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuItemIcon: {
        fontSize: 16,
        textAlign: 'center',
    },
    menuItemLabel: {
        flex: 1,
        color: Colors.white,
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    menuItemArrow: {
        color: Colors.gold.base,
        fontSize: 20,
        lineHeight: 22,
    },
    signOutItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        gap: 14,
        marginTop: 8,
    },
    signOutLabel: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
});
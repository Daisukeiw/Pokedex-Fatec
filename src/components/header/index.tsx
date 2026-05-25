import React, { useRef, useState } from 'react';
import {View, Text, TouchableOpacity, Modal, Animated, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { styles, MENU_WIDTH } from './styles';

interface HeaderProps {
    title: string;
  }
  
export function Header({ title }: HeaderProps) {
  const router = useRouter();
  const { signOut, user } = useAuth();

  // Controla se o modal do menu está aberto ou fechado.
  const [menuOpen, setMenuOpen] = useState(false);

  // Valor inicial da animação: o drawer começa "fora da tela" à direita.
  const slideAnim = useRef(new Animated.Value(MENU_WIDTH)).current;

  // Controla a transparência do fundo escuro atrás do menu.
  const fadeAnim = useRef(new Animated.Value(0)).current;

  function openMenu() {
    setMenuOpen(true);

    // Executa as duas animações juntas:
    // 1. o fundo escurece
    // 2. o drawer desliza da direita para dentro
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function closeMenu(callback?: () => void) {
    // Faz o caminho inverso: drawer sai e overlay some.
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: MENU_WIDTH,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMenuOpen(false);

      // O callback permite fechar primeiro e navegar depois,
      // evitando transições estranhas na interface.
      callback?.();
    });
  }

  function goTo(route: '/(app)/dashboard' | '/(app)/pokedex') {
    closeMenu(() => router.push(route));
  }

  function handleSignOut() {
    closeMenu(async () => {
      await signOut();
      router.replace('/');
    });
  }

  return (
    <>
      <View style={styles.header}>
        <View>
        <Text style={styles.pageTitle}>{title}</Text>
        </View>

        {/* Botão que abre o menu lateral */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={openMenu}
          activeOpacity={0.7}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={menuOpen}
        transparent
        animationType="none"
        onRequestClose={() => closeMenu()}
      >
        {/* Área escura atrás do menu; ao clicar nela, fecha o drawer */}
        <Pressable style={styles.fullScreenPressable} onPress={() => closeMenu()}>
          <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
        </Pressable>

        {/* Drawer lateral que desliza da direita */}
        <Animated.View
          style={[
            styles.drawer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Menu</Text>

            <TouchableOpacity onPress={() => closeMenu()}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Itens de navegação */}
          <TouchableOpacity
            style={styles.item}
            onPress={() => goTo('/(app)/dashboard')}
          >
            <Text style={styles.itemText}>Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => goTo('/(app)/pokedex')}
          >
            <Text style={styles.itemText}>Pokédex</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={handleSignOut}
          >
            <Text style={styles.itemText}>Sair</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </>
  );
}
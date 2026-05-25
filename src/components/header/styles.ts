import { Platform, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

const isWeb = Platform.OS === 'web';

// Largura fixa do menu lateral.
// Exportei para usar também no index.tsx na animação.
export const MENU_WIDTH = 260;

export const styles = StyleSheet.create({
  header: {
    paddingTop: isWeb ? 24 : 16,
    paddingHorizontal: isWeb ? 28 : 20,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },

  menuIcon: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
  },

  fullScreenPressable: {
    ...StyleSheet.absoluteFillObject,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: MENU_WIDTH,
    backgroundColor: 'rgba(10, 10, 10, 0.96)',
    paddingTop: isWeb ? 28 : 22,
    paddingHorizontal: 20,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.12)',
  },

  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  drawerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  closeButton: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  item: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },

  itemText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  pageTitle: {
    color: Colors.white,
    fontSize: isWeb ? 20 : 18,
    fontWeight: '900',
  },
  
});

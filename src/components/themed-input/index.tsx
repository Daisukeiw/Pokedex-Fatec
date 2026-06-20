import { forwardRef, useState } from 'react';
import { TextInput, TextInputProps, StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/colors';

// ─── Campo de texto do tema Black & White (dark + foco dourado) ───────────────
// Usado nas telas de autenticação migradas (login, cadastro...). Mantido
// separado do <Input> claro do design system enquanto a migração é feita por
// partes.
export const ThemedInput = forwardRef<TextInput, TextInputProps>((props, ref) => {
    const [focused, setFocused] = useState(false);
    return (
        <TextInput
            ref={ref}
            placeholderTextColor={Colors.whiteAlpha['35']}
            selectionColor={Colors.gold.base}
            underlineColorAndroid="transparent"
            {...props}
            onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
            style={[styles.input, focused && styles.inputFocused, props.style]}
        />
    );
});

ThemedInput.displayName = 'ThemedInput';

const styles = StyleSheet.create({
    input: {
        width: '100%', height: 52, borderWidth: 1, borderColor: Colors.dark.border,
        backgroundColor: Colors.dark.deepBg, borderRadius: 2, paddingHorizontal: 14,
        color: Colors.white, fontSize: 14, letterSpacing: 0.3,
        ...Platform.select({ web: { outlineStyle: 'none' } as any }),
    },
    inputFocused: {
        borderColor: Colors.gold.base, backgroundColor: Colors.dark.cardAlt,
        ...Platform.select({
            web: { boxShadow: `0 0 0 1px ${Colors.gold.alpha18}` } as any,
            default: { shadowColor: Colors.gold.base, shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 2 },
        }),
    },
});
import React, { useState } from 'react'
import {
    View, Text, TouchableOpacity, StyleSheet,
    SafeAreaView, ScrollView,
    Alert
} from 'react-native'
import GrupoSelector from '../components/menu/grupo_selector'
import { useAppStore } from '../store/useAppStore'
import StatusScreen from './status'
import CreateGroupModal from '../components/menu/create_group'
import JoinGroupModal from '../components/menu/join_group'
import { useNavigation } from '@react-navigation/native'
import { useAuthUser } from '../hooks/useauthuser'
import { Ionicons } from '@expo/vector-icons';

const MenuScreen = () => {
    const [createVisible, setCreateVisible] = useState(false);
    const [joinVisible, setJoinVisible] = useState(false);
    const grupos = useAppStore(s => s.grupos);
    const usuario = useAppStore(s => s.usuarioActivo);

    const authUser = useAuthUser();
    const navigation = useNavigation();

    const isLoggedIn = !!authUser && !authUser.isAnonymous;

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header con botón de login */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 }}>
                <Text style={styles.title}>Menú</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('AuthPanel' as never)} // 👈 nombre de ruta exacto en tu navigator
                    style={{
                        padding: 6,
                        borderRadius: 20,
                        backgroundColor: isLoggedIn ? '#4CD964' : '#C7C7CC',
                    }}
                >
                    <Ionicons name="person" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <GrupoSelector />

                {grupos.length === 0 && (
                    <Text style={styles.alertText}>No tienes ningún grupo.</Text>
                )}

                <View style={styles.buttonsRow}>
                    {isLoggedIn ? (
                        <TouchableOpacity style={styles.createButton} onPress={() => setCreateVisible(true)}>
                            <Text style={styles.createButtonText}>+ Crear nuevo grupo</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.createButton, { backgroundColor: '#ccc' }]}
                            onPress={() => Alert.alert('Inicia sesión', 'Necesitas iniciar sesión para crear un grupo.')}
                        >
                            <Text style={styles.createButtonText}>+ Crear nuevo grupo</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.joinButton} onPress={() => setJoinVisible(true)}>
                        <Text style={styles.joinButtonText}>↳ Unirme por código</Text>
                    </TouchableOpacity>
                </View>

                {/* ... resto de tu lista y status */}
            </ScrollView>

            <CreateGroupModal visible={createVisible} onClose={() => setCreateVisible(false)} />
            <JoinGroupModal visible={joinVisible} onClose={() => setJoinVisible(false)} />
        </SafeAreaView>
    );
};

export default MenuScreen

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    container: { padding: 20, paddingBottom: 32, rowGap: 12 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: '#1C1C1E' },
    subtitle: { fontSize: 18, fontWeight: '600', marginTop: 12, marginBottom: 8, color: '#1C1C1E' },
    alertText: { fontSize: 16, color: '#E94B3C', marginVertical: 6 },
    buttonsRow: { marginTop: 8, gap: 10 },
    createButton: { backgroundColor: '#4A90E2', padding: 12, borderRadius: 10, alignItems: 'center' },
    createButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    joinButton: { backgroundColor: '#1C1C1E', padding: 12, borderRadius: 10, alignItems: 'center' },
    joinButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    listaGrupos: { marginTop: 8, gap: 12 },
    groupItem: { borderWidth: 1, borderColor: '#E5E5EA', borderRadius: 12, padding: 12, backgroundColor: '#F7F7F7' },
    groupName: { fontWeight: 'bold', fontSize: 16, color: '#1C1C1E' },
    groupDesc: { fontSize: 14, color: '#555', marginVertical: 4 },
    groupMeta: { fontSize: 12, color: '#999' },
    statusSection: { marginTop: 16, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5EA', backgroundColor: '#FAFAFA' },
})
import React, { useState } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView
} from 'react-native'
import GrupoSelector from '../components/menu/grupo_selector'
import GrupoModal from '../components/menu/grupo_modal'
import { useAppStore } from '../store/useAppStore'

const MenuScreen = () => {
    const [modalVisible, setModalVisible] = useState(false)
    const grupos = useAppStore((s) => s.grupos)
    const usuario = useAppStore((s) => s.usuarioActivo)

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Menú</Text>

                <GrupoSelector />

                {grupos.length === 0 && (
                    <Text style={styles.alertText}>No tienes ningún grupo creado.</Text>
                )}

                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.createButtonText}>+ Crear nuevo grupo</Text>
                </TouchableOpacity>

                {grupos.length > 0 && (
                    <View style={styles.listaGrupos}>
                        <Text style={styles.subtitle}>Tus grupos:</Text>
                        {grupos.map((grupo) => (
                            <View key={grupo.id} style={styles.groupItem}>
                                <Text style={styles.groupName}>{grupo.nombre}</Text>
                                <Text style={styles.groupDesc}>
                                    {grupo.descripcion || 'Sin descripción'}
                                </Text>
                                <Text style={styles.groupMeta}>
                                    {grupo.miembros.length} miembro(s)
                                    {grupo.adminIds.includes(usuario?.id || '') ? ' • Admin' : ''}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                <GrupoModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                />
            </ScrollView>
        </SafeAreaView>
    )
}

export default MenuScreen

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 24,
        marginBottom: 12,
    },
    alertText: {
        fontSize: 16,
        color: '#E94B3C',
        marginVertical: 10,
    },
    createButton: {
        marginTop: 16,
        backgroundColor: '#4A90E2',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    createButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    listaGrupos: {
        marginTop: 10,
    },
    groupItem: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        backgroundColor: '#F7F7F7',
    },
    groupName: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#1C1C1E',
    },
    groupDesc: {
        fontSize: 14,
        color: '#555',
        marginVertical: 4,
    },
    groupMeta: {
        fontSize: 12,
        color: '#999',
    },
})
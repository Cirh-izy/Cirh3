import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useAppStore } from '../../store/useAppStore'

const GrupoSelector = () => {
    const usuario = useAppStore((s) => s.usuarioActivo)
    const grupos = useAppStore((s) => s.grupos)
    const grupoSeleccionadoId = useAppStore((s) => s.grupoSeleccionadoId)
    const setGrupoSeleccionadoId = useAppStore((s) => s.setGrupoSeleccionadoId)

    const gruposUsuario = grupos.filter((g) =>
        g.miembros.some((m) => m.id === usuario?.id)
    )

    if (gruposUsuario.length === 0) return null

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Selecciona un grupo:</Text>
            {gruposUsuario.map((grupo) => (
                <TouchableOpacity
                    key={grupo.id}
                    style={[
                        styles.groupButton,
                        grupo.id === grupoSeleccionadoId && styles.groupButtonSelected
                    ]}
                    onPress={() => setGrupoSeleccionadoId(grupo.id)}
                >
                    <Text
                        style={[
                            styles.groupButtonText,
                            grupo.id === grupoSeleccionadoId && styles.groupButtonTextSelected
                        ]}
                    >
                        {grupo.nombre}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    )
}

export default GrupoSelector

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        paddingHorizontal: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1C1C1E',
    },
    groupButton: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#F2F2F2',
        borderRadius: 8,
        marginBottom: 8,
    },
    groupButtonSelected: {
        backgroundColor: '#4A90E2',
    },
    groupButtonText: {
        color: '#000',
    },
    groupButtonTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
})
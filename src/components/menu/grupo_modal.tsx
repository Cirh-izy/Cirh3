import React, { useState } from 'react'
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert
} from 'react-native'
import { useAppStore } from '../../store/useAppStore'

interface GrupoModalProps {
    visible: boolean
    onClose: () => void
}

const GrupoModal: React.FC<GrupoModalProps> = ({ visible, onClose }) => {
    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')

    const addGrupo = useAppStore((s) => s.addGrupo)
    const usuario = useAppStore((s) => s.usuarioActivo)

    const setGrupoSeleccionadoId = useAppStore((s) => s.setGrupoSeleccionadoId)

    const handleSave = () => {
        if (!nombre.trim()) {
            Alert.alert('Error', 'El nombre del grupo es obligatorio.')
            return
        }

        const nuevoGrupo = {
            id: Date.now().toString(),
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            miembros: usuario ? [usuario] : [],
            materias: [],
            fechaCreacion: new Date().toISOString(),
            adminIds: usuario?.id ? [usuario.id] : [],
        }

        addGrupo(nuevoGrupo)
        setGrupoSeleccionadoId(nuevoGrupo.id) // ← esta línea es clave
        setNombre('')
        setDescripcion('')
        onClose()
    }

    return (

        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.container}>
                <Text style={styles.title}>Nuevo Grupo</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nombre del grupo"
                    value={nombre}
                    onChangeText={setNombre}
                />
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Descripción"
                    value={descripcion}
                    onChangeText={setDescripcion}
                    multiline
                    numberOfLines={3}
                />
                <TouchableOpacity style={styles.button} onPress={handleSave}>
                    <Text style={styles.buttonText}>Crear grupo</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose}>
                    <Text style={{ color: 'gray', marginTop: 20 }}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    )
}

export default GrupoModal

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#F8F9FA',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#4A90E2',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
})
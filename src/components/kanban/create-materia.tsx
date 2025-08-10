// components/kanban/materia_creation_modal.tsx
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

interface MateriaModalProps {
    visible: boolean
    onClose: () => void
}

const MateriaModal: React.FC<MateriaModalProps> = ({ visible, onClose }) => {
    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')

    const grupoId = useAppStore((s) => s.grupoSeleccionadoId)
    const addMateria = useAppStore((s) => s.addMateria)

    const handleSave = () => {
        if (!nombre.trim()) {
            Alert.alert('Error', 'El nombre de la materia es obligatorio.')
            return
        }

        if (!grupoId) {
            Alert.alert('Error', 'No hay un grupo seleccionado.')
            return
        }

        const nuevaMateria = {
            id: Date.now().toString(),
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            tareas: [],
        }

        addMateria(grupoId, nuevaMateria)
        console.log('Materia que se va a guardar:', nuevaMateria)
        setNombre('')
        setDescripcion('')
        onClose()
    }

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.container}>
                <Text style={styles.title}>Nueva Materia</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nombre de la materia"
                    value={nombre}
                    onChangeText={setNombre}
                />
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Descripción (opcional)"
                    value={descripcion}
                    onChangeText={setDescripcion}
                    multiline
                    numberOfLines={3}
                />
                <TouchableOpacity style={styles.button} onPress={handleSave}>
                    <Text style={styles.buttonText}>Crear materia</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose}>
                    <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    )
}

export default MateriaModal

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
    cancelText: {
        color: 'gray',
        marginTop: 20,
        textAlign: 'center',
    },
})
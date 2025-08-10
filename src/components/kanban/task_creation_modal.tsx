// components/kanban/task_creation_modal.tsx
import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { Modalize } from 'react-native-modalize'
import { IHandles } from 'react-native-modalize/lib/options'
import { useAppStore } from '../../store/useAppStore'
import { Tarea } from '../../models/types'

interface TaskBottomSheetProps {
    modalRef: React.RefObject<IHandles>
    onSave: (tarea: Partial<Tarea>) => void
    editingTask?: Tarea | null
}

const TaskBottomSheet: React.FC<TaskBottomSheetProps> = ({ modalRef, onSave, editingTask }) => {
    const [titulo, setTitulo] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [tipo, setTipo] = useState<'tarea' | 'examen' | 'evento' | 'recordatorio'>('tarea')
    const [fechaEntrega, setFechaEntrega] = useState('')
    const [isDatePickerVisible, setDatePickerVisible] = useState(false)
    const [materiaIdSeleccionada, setMateriaIdSeleccionada] = useState<string | null>(null)

    const usuario = useAppStore((s) => s.usuarioActivo)
    const grupoId = useAppStore((s) => s.grupoSeleccionadoId)
    const grupo = useAppStore((s) => s.grupos.find((g) => g.id === grupoId))
    const materias = grupo?.materias || []

    useEffect(() => {
        if (editingTask) {
            setTitulo(editingTask.titulo || '')
            setDescripcion(editingTask.descripcion || '')
            setTipo(editingTask.tipo || 'tarea')
            setFechaEntrega(editingTask.fechaEntrega?.split('T')[0] || '')
            setMateriaIdSeleccionada(editingTask.materiaId || null)
        } else {
            resetForm()
        }
    }, [editingTask])

    const resetForm = () => {
        setTitulo('')
        setDescripcion('')
        setTipo('tarea')
        setFechaEntrega(new Date().toISOString().split('T')[0])
        setMateriaIdSeleccionada(null)
    }

    const handleSave = () => {
        if (!titulo.trim()) {
            Alert.alert('Error', 'El título es obligatorio')
            return
        }
        if (!materiaIdSeleccionada) {
            Alert.alert('Error', 'Debes seleccionar una materia')
            return
        }

        const tarea: Partial<Tarea> = {
            id: editingTask?.id || Date.now().toString(),
            titulo: titulo.trim(),
            descripcion: descripcion.trim(),
            tipo,
            fechaEntrega: new Date(fechaEntrega).toISOString(),
            materiaId: materiaIdSeleccionada,
            visibleParaTodos: true,
            creadorId: usuario?.id || '',
        }

        console.log('Tarea que se va a guardar:', tarea)
        onSave(tarea)
        modalRef.current?.close()
    }

    return (
        <Modalize
            ref={modalRef}
            adjustToContentHeight
            keyboardAvoidingBehavior="padding"
            onClosed={resetForm} // ✅ se ejecuta cuando el modal se cierra completamente
        >
            <View style={styles.container}>
                <Text style={styles.title}>{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Título"
                    value={titulo}
                    onChangeText={setTitulo}
                />

                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Descripción"
                    value={descripcion}
                    onChangeText={setDescripcion}
                    multiline
                />

                <TouchableOpacity style={styles.input} onPress={() => setDatePickerVisible(true)}>
                    <Text>{fechaEntrega || 'Selecciona una fecha'}</Text>
                </TouchableOpacity>

                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={(date) => {
                        setDatePickerVisible(false)
                        const iso = date.toISOString().split('T')[0]
                        setFechaEntrega(iso)
                    }}
                    onCancel={() => setDatePickerVisible(false)}
                />

                <View style={styles.input}>
                    <Text style={{ marginBottom: 8 }}>Materia:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {materias.map((m) => (
                            <TouchableOpacity
                                key={m.id}
                                style={[styles.materiaButton, materiaIdSeleccionada === m.id && styles.materiaButtonSelected]}
                                onPress={() => setMateriaIdSeleccionada(m.id)}
                            >
                                <Text style={materiaIdSeleccionada === m.id ? styles.materiaButtonTextSelected : styles.materiaButtonText}>
                                    {m.nombre}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveText}>Guardar</Text>
                </TouchableOpacity>
            </View>
        </Modalize>
    )
}

export default TaskBottomSheet

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    materiaButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#F2F2F2',
        borderRadius: 8,
        marginRight: 8,
    },
    materiaButtonSelected: {
        backgroundColor: '#4A90E2',
    },
    materiaButtonText: {
        fontSize: 14,
        color: '#000',
    },
    materiaButtonTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: '#4A90E2',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    saveText: {
        color: 'white',
        fontWeight: 'bold',
    },
})
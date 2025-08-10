// components/kanban/add_actionsheet.tsx
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Modalize } from 'react-native-modalize'
import type { IHandles } from 'react-native-modalize/lib/options'

type Props = {
    modalRef: React.RefObject<IHandles | null>
    onCrearMateria: () => void
    onCrearTarea?: () => void
    mostrarCrearTarea: boolean
}

const AddActionSheet: React.FC<Props> = ({ modalRef, onCrearMateria, onCrearTarea, mostrarCrearTarea }) => {
    return (
        <Modalize
            ref={modalRef}
            adjustToContentHeight
            keyboardAvoidingBehavior="padding"
        >
            <View style={styles.container}>
                <Text style={styles.title}>¿Qué deseas agregar?</Text>

                <TouchableOpacity style={styles.option} onPress={onCrearMateria}>
                    <Text style={styles.optionText}>📘 Crear materia</Text>

                </TouchableOpacity>

                {mostrarCrearTarea && onCrearTarea && (
                    <TouchableOpacity style={styles.option} onPress={onCrearTarea}>
                        <Text style={styles.optionText}>📝 Crear tarea</Text>
                    </TouchableOpacity>
                )}
            </View>
        </Modalize>
    )
}

export default AddActionSheet

const styles = StyleSheet.create({
    container: {
        padding: 24,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    option: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    optionText: {
        fontSize: 16,
        color: '#007AFF',
    },
})

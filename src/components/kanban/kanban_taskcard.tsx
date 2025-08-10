import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Tarea } from '../../models/types'
import Feather from 'react-native-vector-icons/Feather'

interface KanbanTaskCardProps {
    tarea: Tarea & { estado: string }
    onEdit: (tarea: Tarea) => void
    onDelete: (tareaId: string) => void
    onToggleStatus: (tareaId: string, currentStatus: string) => void
}

const KanbanTaskCard: React.FC<KanbanTaskCardProps> = ({
    tarea,
    onEdit,
    onDelete,
    onToggleStatus
}) => {
    const getTypeIcon = (tipo: string) => {
        switch (tipo) {
            case 'tarea': return ''
            case 'examen': return ''
            case 'evento': return ''
            case 'recordatorio': return ''
            default: return ''
        }
    }

    const getTypeColor = (tipo: string) => {
        switch (tipo) {
            case 'tarea': return '#4A90E2'
            case 'examen': return '#E94B3C'
            case 'evento': return '#50C878'
            case 'recordatorio': return '#F5A623'
            default: return '#8E8E93'
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        })
    }

    const isOverdue = () => {
        const today = new Date()
        const dueDate = new Date(tarea.fechaEntrega)
        return dueDate < today && tarea.estado === 'pendiente'
    }

    return (
        <View style={[
            styles.taskCard,
            { borderLeftColor: getTypeColor(tarea.tipo) },
            isOverdue() && styles.overdue
        ]}>
            <View style={styles.taskHeader}>
                <View style={styles.taskTypeContainer}>
                    <Text style={styles.taskTypeIcon}>{getTypeIcon(tarea.tipo)}</Text>
                    <Text style={[styles.taskType, { color: getTypeColor(tarea.tipo) }]}>
                        {tarea.tipo.toUpperCase()}
                    </Text>
                </View>
                <View style={styles.taskActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                    // onPress={() => onToggleStatus(tarea.id, tarea.estado)}
                    >
                        {/* <Text style={styles.actionButtonText}>
        {tarea.estado === 'pendiente' ? '✅' : '↩️'}
    </Text> */}
                    </TouchableOpacity>
                    {/* Botón de editar */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => onEdit(tarea)}
                    >
                        <Feather name="edit" size={18} color="#1C1C1E" />
                    </TouchableOpacity>

                    {/* Botón de eliminar */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => onDelete(tarea.id)}
                    >
                        <Feather name="trash" size={18} color="#1C1C1E" />
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.taskTitle}>{tarea.titulo}</Text>
            {tarea.descripcion && (
                <Text style={styles.taskDescription}>{tarea.descripcion}</Text>
            )}

            <View style={styles.taskFooter}>
                <Text style={[
                    styles.taskDate,
                    isOverdue() && styles.overdueDate
                ]}>
                    {formatDate(tarea.fechaEntrega)}
                </Text>
                {isOverdue() && (
                    <Text style={styles.overdueLabel}>VENCIDA</Text>
                )}
            </View>
        </View>
    )
}

export default KanbanTaskCard

const styles = StyleSheet.create({
    taskCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    overdue: {
        backgroundColor: '#FFF5F5',
        borderColor: '#FF6B6B',
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    taskTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    taskTypeIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    taskType: {
        fontSize: 12,
        fontWeight: '600',
    },
    taskActions: {
        flexDirection: 'row',
    },
    actionButton: {
        padding: 4,
        marginLeft: 8,
    },
    actionButtonText: {
        fontSize: 16,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 4,
    },
    taskDescription: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 12,
        lineHeight: 20,
    },
    taskFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    taskDate: {
        fontSize: 12,
        color: '#8E8E93',
    },
    overdueDate: {
        color: '#FF6B6B',
        fontWeight: '600',
    },
    overdueLabel: {
        backgroundColor: '#FF6B6B',
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
})
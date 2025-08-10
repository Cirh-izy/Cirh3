// import React from 'react'
// import { View, Text, StyleSheet } from 'react-native'
// import { Tarea } from '../models/types'

// export default function TareaCard({ tarea }: { tarea: Tarea }) {
//     return (
//         <View style={styles.card}>
//             <Text style={styles.title}>{tarea.titulo}</Text>
//             {tarea.descripcion ? (
//                 <Text style={styles.description}>{tarea.descripcion}</Text>
//             ) : null}
//             <Text style={styles.fecha}>Entrega: {tarea.fechaEntrega}</Text>
//         </View>
//     )
// }

// const styles = StyleSheet.create({
//     card: {
//         backgroundColor: '#fff',
//         borderRadius: 10,
//         padding: 12,
//         marginBottom: 10,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.1,
//         shadowRadius: 2,
//         elevation: 2,
//     },
//     title: {
//         fontWeight: 'bold',
//         fontSize: 16,
//     },
//     description: {
//         fontSize: 14,
//         color: '#666',
//         marginVertical: 4,
//     },
//     fecha: {
//         fontSize: 12,
//         color: '#999',
//     },
// })
// useUserStore.ts
import { create } from 'zustand'
import { Usuario } from '../models/types'

type UserState = {
    usuario?: Usuario
    setUsuario: (usuario: Usuario) => void
    logout: () => void
}

export const useUserStore = create<UserState>((set) => ({
    usuario: undefined,
    setUsuario: (usuario) => set({ usuario }),
    logout: () => set({ usuario: undefined }),
}))
export const colGroups = 'groups';
export const colMembers = 'members';
export const colMaterias = 'materias';
export const colTareas = 'tareas';
export const colAssignments = 'assignments';

export const pathGroup = (groupId: string) => `${colGroups}/${groupId}`;
export const pathMember = (groupId: string, userId: string) =>
    `${colGroups}/${groupId}/${colMembers}/${userId}`;
export const pathMaterias = (groupId: string) =>
    `${colGroups}/${groupId}/${colMaterias}`;
export const pathTareas = (groupId: string, materiaId: string) =>
    `${colGroups}/${groupId}/${colMaterias}/${materiaId}/${colTareas}`;

export function genJoinCode(len = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
}
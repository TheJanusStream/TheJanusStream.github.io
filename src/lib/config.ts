/** Crate names tracked on crates.io */
export const CRATES = [
    'symbios-genetics', 'symbios', 'symbios-turtle-3d', 'symbios-robot', 'symbios-ground', 'symbios-tensor', 'symbios-shape', 'symbios-neat',
    'bevy_symbios', 'bevy_symbios_texture', 'bevy_symbios_ground', 'bevy_symbios_shape', 'bevy_symbios_multiuser'
] as const;

/** GitHub repositories (org/repo format) */
export const GITHUB_REPOS = [
    'TheJanusStream/the-janus-foundry',
    'TheJanusStream/lsystem-explorer',
    'TheJanusStream/symbios-ground-lab',
    'TheJanusStream/symbios-robot-lab',
    'TheJanusStream/symbios-overlands',
    'TheJanusStream/symbios-genetics',
    'TheJanusStream/symbios',
    'TheJanusStream/symbios-turtle-3d',
    'TheJanusStream/symbios-robot',
    'TheJanusStream/symbios-ground',
    'TheJanusStream/symbios-tensor',
    'TheJanusStream/symbios-shape',
    'TheJanusStream/symbios-neat',
    'TheJanusStream/bevy_symbios',
    'TheJanusStream/bevy_symbios_texture',
    'TheJanusStream/bevy_symbios_ground',
    'TheJanusStream/bevy_symbios_shape',
    'TheJanusStream/bevy_symbios_multiuser'
] as const;

/** Application-layer project names */
export const APP_NAMES = ['lsystem-explorer', 'symbios-ground-lab', 'symbios-robot-lab', 'symbios-overlands'] as const;

/** Bevy-layer crate names */
export const BEVY_NAMES = ['bevy_symbios_texture', 'bevy_symbios', 'bevy_symbios_multiuser', 'bevy_symbios_ground', 'bevy_symbios_shape'] as const;

/** Dependency topology derived from Cargo.toml analysis */
export const DEPENDENCY_MAP: Record<string, string[]> = {
    // Apps → Bevy + Agnostic layers
    'lsystem-explorer': ['bevy_symbios', 'bevy_symbios_texture', 'symbios', 'symbios-turtle-3d', 'symbios-genetics'],
    'symbios-ground-lab': ['bevy_symbios_ground', 'bevy_symbios_shape', 'bevy_symbios_texture', 'symbios-ground', 'symbios-shape', 'symbios-tensor'],
    'symbios-robot-lab': ['bevy_symbios', 'symbios', 'symbios-robot', 'symbios-neat', 'symbios-genetics'],
    'symbios-overlands': ['bevy_symbios_texture', "bevy_symbios_multiuser", "symbios-ground", "bevy_symbios_ground", "bevy_symbios", "symbios", "symbios-turtle-3d", "symbios-shape", "bevy_symbios_shape"],
    // Bevy → Agnostic layer
    'bevy_symbios': ['symbios', 'symbios-turtle-3d', 'bevy_symbios_texture'],
    'bevy_symbios_texture': ['symbios-genetics'],
    'bevy_symbios_ground': ['symbios-ground'],
    'bevy_symbios_shape': ['symbios-shape', 'bevy_symbios_texture'],
    // Agnostic intra-layer
    'symbios-shape': ['symbios-genetics'],
    'symbios-tensor': ['symbios-ground'],
    'symbios-neat': ['symbios-genetics'],
};

export type Locale = 'es' | 'en';

export const translations = {
  es: {
    // Navigation
    nav_dashboard: 'Panel Principal',
    nav_evaluaciones: 'Evaluaciones',
    nav_mis_notas: 'Mis Notas',
    nav_logout: 'Cerrar Sesión',
    nav_admin: 'Admin',

    // Landing
    landing_title: 'Portal de Evaluaciones',
    landing_subtitle: 'Gestiona tus asignaturas, evaluaciones y calificaciones en un solo lugar.',
    landing_login: 'Iniciar Sesión',
    landing_register: 'Registrarse',
    landing_feature1_title: 'Evaluaciones',
    landing_feature1_desc: 'Consulta las fechas y porcentajes de todas tus evaluaciones.',
    landing_feature2_title: 'Mis Notas',
    landing_feature2_desc: 'Registra y calcula tus notas automáticamente.',
    landing_feature3_title: 'Administración',
    landing_feature3_desc: 'Los administradores pueden gestionar asignaturas y evaluaciones.',

    // Auth
    login_title: 'Iniciar Sesión',
    login_username: 'Nombre de usuario',
    login_password: 'Contraseña',
    login_button: 'Entrar',
    login_no_account: '¿No tienes cuenta?',
    login_register_link: 'Regístrate aquí',
    login_error_invalid: 'Usuario o contraseña incorrectos',
    login_error_required: 'Todos los campos son obligatorios',

    register_title: 'Crear Cuenta',
    register_email: 'Correo electrónico',
    register_name: 'Nombre completo',
    register_username: 'Nombre de usuario',
    register_password: 'Contraseña',
    register_confirm_password: 'Confirmar contraseña',
    register_button: 'Registrarse',
    register_has_account: '¿Ya tienes cuenta?',
    register_login_link: 'Inicia sesión',
    register_error_required: 'Todos los campos son obligatorios',
    register_error_password_match: 'Las contraseñas no coinciden',
    register_error_password_length: 'La contraseña debe tener al menos 6 caracteres',
    register_error_email_exists: 'El correo ya está registrado',
    register_error_username_exists: 'El nombre de usuario ya está en uso',

    // Dashboard
    dashboard_welcome: 'Bienvenido/a,',
    dashboard_role_admin: 'Administrador',
    dashboard_role_student: 'Estudiante',
    dashboard_card_evaluaciones: 'Ver Evaluaciones',
    dashboard_card_evaluaciones_desc: 'Consulta las fechas, porcentajes y tipos de evaluación de cada asignatura.',
    dashboard_card_notas: 'Mis Notas',
    dashboard_card_notas_desc: 'Ingresa tus calificaciones y calcula tu promedio ponderado por asignatura.',
    dashboard_card_admin: 'Administrar',
    dashboard_card_admin_desc: 'Agrega, edita y ordena asignaturas y evaluaciones.',

    // Evaluaciones
    eval_title: 'Evaluaciones',
    eval_subtitle: 'Detalle de evaluaciones por asignatura',
    eval_percentage: 'Ponderación',
    eval_type: 'Tipo',
    eval_date: 'Fecha',
    eval_no_date: 'Sin fecha definida',
    eval_add_subject: 'Agregar Asignatura',
    eval_edit: 'Editar',
    eval_delete: 'Eliminar',
    eval_save: 'Guardar',
    eval_cancel: 'Cancelar',
    eval_confirm_delete: '¿Estás seguro de eliminar esta asignatura?',

    // Mis Notas
    grades_title: 'Mis Notas',
    grades_subtitle: 'Ingresa tus calificaciones para ver tu promedio ponderado',
    grades_input_placeholder: 'Nota',
    grades_save: 'Guardar Notas',
    grades_saved: '¡Notas guardadas correctamente!',
    grades_weighted_avg: 'Promedio Ponderado',
    grades_final_avg: 'Promedio Final',
    grades_eval_avg: 'Promedio Evaluación',
    grades_not_graded: 'Sin nota',

    // General
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    language: 'Idioma',
    spanish: 'Español',
    english: 'English',
  },
  en: {
    // Navigation
    nav_dashboard: 'Dashboard',
    nav_evaluaciones: 'Evaluations',
    nav_mis_notas: 'My Grades',
    nav_logout: 'Log Out',
    nav_admin: 'Admin',

    // Landing
    landing_title: 'Evaluations Portal',
    landing_subtitle: 'Manage your subjects, evaluations, and grades in one place.',
    landing_login: 'Log In',
    landing_register: 'Register',
    landing_feature1_title: 'Evaluations',
    landing_feature1_desc: 'Check dates and percentages of all your evaluations.',
    landing_feature2_title: 'My Grades',
    landing_feature2_desc: 'Record and calculate your grades automatically.',
    landing_feature3_title: 'Administration',
    landing_feature3_desc: 'Administrators can manage subjects and evaluations.',

    // Auth
    login_title: 'Log In',
    login_username: 'Username',
    login_password: 'Password',
    login_button: 'Sign In',
    login_no_account: "Don't have an account?",
    login_register_link: 'Register here',
    login_error_invalid: 'Invalid username or password',
    login_error_required: 'All fields are required',

    register_title: 'Create Account',
    register_email: 'Email address',
    register_name: 'Full name',
    register_username: 'Username',
    register_password: 'Password',
    register_confirm_password: 'Confirm password',
    register_button: 'Register',
    register_has_account: 'Already have an account?',
    register_login_link: 'Sign in',
    register_error_required: 'All fields are required',
    register_error_password_match: 'Passwords do not match',
    register_error_password_length: 'Password must be at least 6 characters',
    register_error_email_exists: 'Email is already registered',
    register_error_username_exists: 'Username is already taken',

    // Dashboard
    dashboard_welcome: 'Welcome,',
    dashboard_role_admin: 'Administrator',
    dashboard_role_student: 'Student',
    dashboard_card_evaluaciones: 'View Evaluations',
    dashboard_card_evaluaciones_desc: 'Check dates, percentages, and evaluation types for each subject.',
    dashboard_card_notas: 'My Grades',
    dashboard_card_notas_desc: 'Enter your grades and calculate your weighted average per subject.',
    dashboard_card_admin: 'Manage',
    dashboard_card_admin_desc: 'Add, edit, and organize subjects and evaluations.',

    // Evaluaciones
    eval_title: 'Evaluations',
    eval_subtitle: 'Evaluation details by subject',
    eval_percentage: 'Weight',
    eval_type: 'Type',
    eval_date: 'Date',
    eval_no_date: 'Date not defined',
    eval_add_subject: 'Add Subject',
    eval_edit: 'Edit',
    eval_delete: 'Delete',
    eval_save: 'Save',
    eval_cancel: 'Cancel',
    eval_confirm_delete: 'Are you sure you want to delete this subject?',

    // Mis Notas
    grades_title: 'My Grades',
    grades_subtitle: 'Enter your grades to see your weighted average',
    grades_input_placeholder: 'Grade',
    grades_save: 'Save Grades',
    grades_saved: 'Grades saved successfully!',
    grades_weighted_avg: 'Weighted Average',
    grades_final_avg: 'Final Average',
    grades_eval_avg: 'Evaluation Average',
    grades_not_graded: 'Not graded',

    // General
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    language: 'Language',
    spanish: 'Español',
    english: 'English',
  },
} as const;

export type TranslationKey = keyof typeof translations.es;

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] || translations.es[key] || key;
}

class Tarea {
    constructor(id, descripcion) {
        this._id = id;
        this._descripcion = descripcion;
    }
    // Getters y Setters
}

class TareaManager {
    constructor() {
        this.tareas = [];
    }

    agregarTarea(descripcion) {
        // Por implementar
        console.log("prueba", descripcion);
    }

    renderizar() {
        // Por implementar visualización
    }
}

// Inicialización básica
const manager = new TareaManager();
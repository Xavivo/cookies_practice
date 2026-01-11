class Tarea {
    constructor(id, descripcion) {
        this._id = id;
        this._descripcion = descripcion;
    }

    // getters y setters
    get id() { return this._id; }
    get descripcion() { return this._descripcion; }
    set descripcion(nuevaDescripcion) { this._descripcion = nuevaDescripcion; }
}

// lógica de negocio y de las cookies 
class TareaManager {
    constructor() {
        this.tareas = [];
        this.cargarDesdeCookies(); // cargar en cuanto inicia
    }

    // añadir tarea
    agregarTarea(descripcion) {
        const id = Date.now().toString(); // generación de id único
        const nuevaTarea = new Tarea(id, descripcion);
        this.tareas.push(nuevaTarea);
        this.guardarEnCookies();
        this.renderizar();
    }

    // obtenemos tareas para visualización
    obtenerTareas() {
        return this.tareas;
    }

    // editar tareas
    editarTarea(id, nuevaDescripcion) {
        const tarea = this.tareas.find(t => t.id === id);
        if (tarea) {
            tarea.descripcion = nuevaDescripcion; // usa el setter
            this.guardarEnCookies();
            this.renderizar();
        }
    }

    // eliminar tareas
    eliminarTarea(id) {
        this.tareas = this.tareas.filter(t => t.id !== id);
        this.guardarEnCookies();
        this.renderizar();
    }

    // guardamos las cookies
    guardarEnCookies() {
        // convertimos a JSON
        const jsonTareas = JSON.stringify(this.tareas);
        // guardamos en las cookies con una duración muy larga (aproximadamente 1 año)
        document.cookie = `tareas=${encodeURIComponent(jsonTareas)}; path=/; max-age=31536000`;
    }

    // cargamos las cookies
    cargarDesdeCookies() {
        const cookies = document.cookie.split(';');
        const cookieTareas = cookies.find(c => c.trim().startsWith('tareas='));
        
        if (cookieTareas) {
            try {
                const jsonString = decodeURIComponent(cookieTareas.split('=')[1]);
                const listaSimple = JSON.parse(jsonString);
                // reconstruimos objetos de la clase tarea
                this.tareas = listaSimple.map(t => new Tarea(t._id, t._descripcion));
            } catch (e) {
                console.error("Error al leer cookies", e);
                this.tareas = [];
            }
        }
        this.renderizar();
    }

    // renderizar la tabla
    renderizar() {
        // buscamos el div contenedor
        const contenedor = document.getElementById('contenedorTareas');
        contenedor.innerHTML = ''; // limpiamos contenedor actual

        if (this.tareas.length === 0) {
            // mensaje por si no hay tareas
            contenedor.innerHTML = '<p class="text-center text-muted col-12 mt-4">No hay tareas pendientes, prueba a añadir una :D</p>';
            return;
        }

        this.tareas.forEach(tarea => {
            // creamos un div columna para cada tarjeta nueva
            const divCol = document.createElement('div');
            divCol.className = 'col-12 col-md-6 col-lg-4';
            
            // bootstrap para las tarjetas
            divCol.innerHTML = `
                <div class="card h-100 shadow-sm border-0 rounded-4">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="badge bg-light text-secondary border rounded-pill">ID: ${tarea.id.slice(-4)}</span>
                        </div>
                        <h5 class="card-title fw-bold text-dark mb-4 text-break">${tarea.descripcion}</h5>
                        <div class="mt-auto d-flex justify-content-end gap-2 pt-3 border-top">
                            <button class="btn btn-outline-warning btn-sm rounded-circle btn-editar" style="width: 32px; height: 32px;" data-id="${tarea.id}">
                                <i class="bi bi-pencil-fill pointer-events-none"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-sm rounded-circle btn-eliminar" style="width: 32px; height: 32px;" data-id="${tarea.id}">
                                <i class="bi bi-trash-fill pointer-events-none"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            contenedor.appendChild(divCol);
        });
    }
}

// interacciones

const manager = new TareaManager();
let tareaIdParaEliminar = null; // variable temporal para almacenar el ID de la tarea a eliminar

// modales en bootstrap
const formModal = new bootstrap.Modal(document.getElementById('formModal'));
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

const inputId = document.getElementById('tareaId');
const inputDesc = document.getElementById('tareaDescripcion');

// añadir
document.getElementById('btnNuevaTarea').addEventListener('click', () => {
    inputId.value = ''; // limpiamos el id
    inputDesc.value = ''; // limpiamos la descripción de la tarea
    document.getElementById('formModalLabel').innerText = 'Nueva Tarea';
    formModal.show();
});

// guardar al hacer click
document.getElementById('btnGuardar').addEventListener('click', () => {
    const descripcion = inputDesc.value.trim();
    const id = inputId.value;

    // validación simple 
    if (!descripcion) {
        alert("La descripción no puede estar vacía.");
        return;
    }

    if (id) {
        // si hay id, editamos
        manager.editarTarea(id, descripcion);
    } else {
        // si no hay id, creamos nueva tarea
        manager.agregarTarea(descripcion);
    }

    formModal.hide(); // cerrarmos el modal con esta función
});

document.getElementById('contenedorTareas').addEventListener('click', (e) => {
    const btnEditar = e.target.closest('.btn-editar');
    const btnEliminar = e.target.closest('.btn-eliminar');

    // editar
    if (btnEditar) {
        const id = btnEditar.getAttribute('data-id');
        const tarea = manager.obtenerTareas().find(t => t.id === id);
        
        inputId.value = tarea.id;
        inputDesc.value = tarea.descripcion;
        document.getElementById('formModalLabel').innerText = 'Editar Tarea';
        
        formModal.show();
    }

    // eliminar
    if (btnEliminar) {
        tareaIdParaEliminar = btnEliminar.getAttribute('data-id');
        deleteModal.show();
    }
});

// confirmación de la eliminación
document.getElementById('btnConfirmarEliminar').addEventListener('click', () => {
    if (tareaIdParaEliminar) {
        manager.eliminarTarea(tareaIdParaEliminar);
        tareaIdParaEliminar = null;
        deleteModal.hide(); // cerramos el modal
    }
});
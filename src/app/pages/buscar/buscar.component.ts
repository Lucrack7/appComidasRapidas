import { CommonModule } from '@angular/common';
import { Component, WritableSignal, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Busqueda } from 'src/app/core/interfaces/busqueda';
import { HeaderService } from 'src/app/core/services/header.service';
import { ProductosService } from 'src/app/core/services/productos.service';
import { TarjetaArticuloComponent } from "../../core/components/tarjeta-articulo/tarjeta-producto.component";
import { Producto } from 'src/app/core/interfaces/productos';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-buscar',
  templateUrl: './buscar.component.html',
  styleUrls: ['./buscar.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TarjetaArticuloComponent, RouterModule]
})
export class BuscarComponent {
  headerService = inject(HeaderService);
  productosService = inject(ProductosService);
  productos: WritableSignal<Producto[]> = signal([]);
  cargando = signal(true);
  paginaActual = signal(1);
  totalProductos = signal(0);
  productosPorPagina = 10;

  parametrosBusqueda: Busqueda = {
    texto: "",
    aptoCeliaco: false,
    aptoVegano: false,
  };
Math: any;

  ngOnInit(): void {
    this.headerService.titulo.set("Buscar");
    this.cargarProductos();
  }

  async cargarProductos() {
    this.cargando.set(true);
    const productos = await this.productosService.getPaginated(this.paginaActual(), this.productosPorPagina);
    this.productos.set(productos);
    this.totalProductos.set((await this.productosService.getAll()).length); // Total para paginación
    this.cargando.set(false);
  }

  async buscar() {
    this.cargando.set(true);
    this.paginaActual.set(1); // Reiniciar a la primera página al buscar
    const productos = await this.productosService.buscarConPaginacion(
      this.parametrosBusqueda,
      this.paginaActual(),
      this.productosPorPagina
    );
    this.productos.set(productos);
    this.cargando.set(false);
  }

  async cambiarPagina(direccion: number) {
    const nuevaPagina = this.paginaActual() + direccion;
    if (nuevaPagina < 1 || nuevaPagina > Math.ceil(this.totalProductos() / this.productosPorPagina)) {
      return; // No avanzar si está fuera del rango
    }
    this.paginaActual.set(nuevaPagina);
    if (this.parametrosBusqueda.texto || this.parametrosBusqueda.aptoCeliaco || this.parametrosBusqueda.aptoVegano) {
      // Si hay búsqueda activa, usar la búsqueda paginada
      const productos = await this.productosService.buscarConPaginacion(
        this.parametrosBusqueda,
        nuevaPagina,
        this.productosPorPagina
      );
      this.productos.set(productos);
    } else {
      // Cargar productos normales paginados
      await this.cargarProductos();
    }
  }
}

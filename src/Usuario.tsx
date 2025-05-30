export class Usuario {
  id: number;
  nombreCompleto: string;
  login: string;
  password: string;
  saldo: number;
  rol: 'cliente' | 'admin';

  constructor(
    id: number,
    nombreCompleto: string,
    login: string,
    password: string,
    saldo: number,
    rol: 'cliente' | 'admin' = 'cliente'
  ) {
    this.id = id;
    this.nombreCompleto = nombreCompleto;
    this.login = login;
    this.password = password;
    this.saldo = saldo;
    this.rol = rol;
  }
}
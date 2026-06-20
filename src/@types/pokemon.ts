export interface Poder {
    nome: string;
    forca: number;
}
 
export interface Pokemon {
    id: number;      // ← ID numérico usado pela API de time
    index: string;   // ID formatado com zeros
    nome: string;
    imagem: string;
    tipos: string[];
    poderes: Poder[];
    habilidades?: string[];
}
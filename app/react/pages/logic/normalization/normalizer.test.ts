import { closureOf, normalizeTable } from "./normalizer";
import type {
	FunctionalDependency,
	NormalizationTable,
	NormalizedTable,
} from "./types";

/* ───────────── helpers ───────────── */

type Case = {
	title: string;
	table: NormalizationTable;
	expected: NormalizedTable[];
};

// compara nome, atributos, PK e FKs sem depender da ordem
const shape = (t: NormalizedTable) => ({
	name: t.name,
	attributes: [...t.attributes].sort(),
	primaryKey: [...t.primaryKey].sort(),
	foreignKeys: [...t.foreignKeys].sort(),
});

const byName = (a: NormalizedTable, b: NormalizedTable) =>
	a.name.localeCompare(b.name);

const implies = (
	dependencies: FunctionalDependency[],
	dependency: FunctionalDependency,
) => {
	const closure = closureOf(dependency.left, dependencies);
	return dependency.right.every((attribute) => closure.has(attribute));
};

// a cobertura mínima não é única, então as dependências são comparadas por equivalência
const equivalent = (a: FunctionalDependency[], b: FunctionalDependency[]) =>
	a.every((fd) => implies(b, fd)) && b.every((fd) => implies(a, fd));

/* ───────────── casos ───────────── */

const cases: Case[] = [
	{
		title: "2NF clássico: separa dependência parcial da chave composta",
		table: {
			name: "Pedido",
			attributes: [
				"PedidoID",
				"ProdutoID",
				"ClienteID",
				"NomeCliente",
				"Quantidade",
			],
			primaryKey: ["PedidoID", "ProdutoID"],
			dependencies: [
				{ left: ["PedidoID"], right: ["ClienteID", "NomeCliente"] },
				{ left: ["PedidoID", "ProdutoID"], right: ["Quantidade"] },
			],
		},
		expected: [
			{
				name: "Pedido_PedidoID_ProdutoID",
				attributes: ["PedidoID", "ProdutoID", "Quantidade"],
				primaryKey: ["PedidoID", "ProdutoID"],
				foreignKeys: ["PedidoID -> Pedido_PedidoID"],
				dependencies: [
					{ left: ["PedidoID", "ProdutoID"], right: ["Quantidade"] },
				],
			},
			{
				name: "Pedido_PedidoID",
				attributes: ["PedidoID", "ClienteID", "NomeCliente"],
				primaryKey: ["PedidoID"],
				foreignKeys: [],
				dependencies: [
					{ left: ["PedidoID"], right: ["ClienteID", "NomeCliente"] },
				],
			},
		],
	},
	{
		title: "3NF clássico: separa dependência transitiva",
		table: {
			name: "Funcionario",
			attributes: [
				"FuncionarioID",
				"Nome",
				"DepartamentoID",
				"NomeDepartamento",
			],
			primaryKey: ["FuncionarioID"],
			dependencies: [
				{ left: ["FuncionarioID"], right: ["Nome", "DepartamentoID"] },
				{ left: ["DepartamentoID"], right: ["NomeDepartamento"] },
			],
		},
		expected: [
			{
				name: "Funcionario_FuncionarioID",
				attributes: ["FuncionarioID", "Nome", "DepartamentoID"],
				primaryKey: ["FuncionarioID"],
				foreignKeys: ["DepartamentoID -> Funcionario_DepartamentoID"],
				dependencies: [
					{ left: ["FuncionarioID"], right: ["Nome", "DepartamentoID"] },
				],
			},
			{
				name: "Funcionario_DepartamentoID",
				attributes: ["DepartamentoID", "NomeDepartamento"],
				primaryKey: ["DepartamentoID"],
				foreignKeys: [],
				dependencies: [
					{ left: ["DepartamentoID"], right: ["NomeDepartamento"] },
				],
			},
		],
	},
	{
		title:
			"Table (propriedades): duas chaves candidatas, Area -> Preco e Nome_cidade -> Imposto",
		table: {
			name: "Table",
			attributes: [
				"Identificador_propriedade",
				"Nome_cidade",
				"Numero_lote",
				"Area",
				"Preco",
				"Imposto",
			],
			primaryKey: ["Identificador_propriedade"],
			dependencies: [
				{
					left: ["Identificador_propriedade"],
					right: ["Nome_cidade", "Numero_lote", "Area", "Preco", "Imposto"],
				},
				{
					left: ["Nome_cidade", "Numero_lote"],
					right: ["Identificador_propriedade", "Area", "Preco", "Imposto"],
				},
				{ left: ["Area"], right: ["Preco"] },
				{ left: ["Nome_cidade"], right: ["Imposto"] },
			],
		},
		expected: [
			{
				name: "Table_Identificador_propriedade",
				attributes: [
					"Identificador_propriedade",
					"Nome_cidade",
					"Numero_lote",
					"Area",
				],
				primaryKey: ["Identificador_propriedade"],
				foreignKeys: ["Nome_cidade -> Table_Nome_cidade", "Area -> Table_Area"],
				dependencies: [
					{
						left: ["Identificador_propriedade"],
						right: ["Nome_cidade", "Numero_lote", "Area"],
					},
					{
						left: ["Nome_cidade", "Numero_lote"],
						right: ["Identificador_propriedade"],
					},
				],
			},
			{
				name: "Table_Nome_cidade",
				attributes: ["Nome_cidade", "Imposto"],
				primaryKey: ["Nome_cidade"],
				foreignKeys: [],
				dependencies: [{ left: ["Nome_cidade"], right: ["Imposto"] }],
			},
			{
				name: "Table_Area",
				attributes: ["Area", "Preco"],
				primaryKey: ["Area"],
				foreignKeys: [],
				dependencies: [{ left: ["Area"], right: ["Preco"] }],
			},
		],
	},
	{
		title: "EMP_PROJ: dependências parciais da chave composta (SSN, PENUMERO)",
		table: {
			name: "EMP_PROJ",
			attributes: [
				"SSN",
				"PENUMERO",
				"HORAS",
				"ENOME",
				"PNOME",
				"PLOCALIZACAO",
			],
			primaryKey: ["SSN", "PENUMERO"],
			dependencies: [
				{ left: ["SSN", "PENUMERO"], right: ["HORAS"] },
				{ left: ["SSN"], right: ["ENOME"] },
				{ left: ["PENUMERO"], right: ["PNOME", "PLOCALIZACAO"] },
			],
		},
		expected: [
			{
				name: "EMP_PROJ_SSN_PENUMERO",
				attributes: ["SSN", "PENUMERO", "HORAS"],
				primaryKey: ["SSN", "PENUMERO"],
				foreignKeys: ["SSN -> EMP_PROJ_SSN", "PENUMERO -> EMP_PROJ_PENUMERO"],
				dependencies: [{ left: ["SSN", "PENUMERO"], right: ["HORAS"] }],
			},
			{
				name: "EMP_PROJ_SSN",
				attributes: ["SSN", "ENOME"],
				primaryKey: ["SSN"],
				foreignKeys: [],
				dependencies: [{ left: ["SSN"], right: ["ENOME"] }],
			},
			{
				name: "EMP_PROJ_PENUMERO",
				attributes: ["PENUMERO", "PNOME", "PLOCALIZACAO"],
				primaryKey: ["PENUMERO"],
				foreignKeys: [],
				dependencies: [
					{ left: ["PENUMERO"], right: ["PNOME", "PLOCALIZACAO"] },
				],
			},
		],
	},
	{
		title:
			"TABELAO_COM_TUDO: sem PK declarada, chave calculada (CPF, num_agencia)",
		table: {
			name: "TABELAO_COM_TUDO",
			attributes: [
				"CPF",
				"nome",
				"estado",
				"cidade",
				"rua",
				"num_agencia",
				"nome_agencia",
				"CEP",
				"CNPJ",
			],
			primaryKey: [],
			dependencies: [
				{ left: ["CPF"], right: ["nome", "estado", "cidade", "rua", "CEP"] },
				{
					left: ["num_agencia"],
					right: ["nome_agencia", "CNPJ", "cidade", "estado"],
				},
				{ left: ["CEP"], right: ["estado", "cidade", "rua"] },
			],
		},
		expected: [
			{
				name: "TABELAO_COM_TUDO_CPF_num_agencia",
				attributes: ["CPF", "num_agencia"],
				primaryKey: ["CPF", "num_agencia"],
				foreignKeys: [
					"CPF -> TABELAO_COM_TUDO_CPF",
					"num_agencia -> TABELAO_COM_TUDO_num_agencia",
				],
				dependencies: [],
			},
			{
				name: "TABELAO_COM_TUDO_CPF",
				attributes: ["CPF", "nome", "CEP"],
				primaryKey: ["CPF"],
				foreignKeys: ["CEP -> TABELAO_COM_TUDO_CEP"],
				dependencies: [{ left: ["CPF"], right: ["nome", "CEP"] }],
			},
			{
				name: "TABELAO_COM_TUDO_num_agencia",
				attributes: ["num_agencia", "nome_agencia", "CNPJ", "cidade", "estado"],
				primaryKey: ["num_agencia"],
				foreignKeys: [],
				dependencies: [
					{
						left: ["num_agencia"],
						right: ["nome_agencia", "CNPJ", "cidade", "estado"],
					},
				],
			},
			{
				name: "TABELAO_COM_TUDO_CEP",
				attributes: ["CEP", "estado", "cidade", "rua"],
				primaryKey: ["CEP"],
				foreignKeys: [],
				dependencies: [{ left: ["CEP"], right: ["estado", "cidade", "rua"] }],
			},
		],
	},
	{
		title: "TABLE (A-J): cadeia CD -> I -> H -> J",
		table: {
			name: "TABLE",
			attributes: ["A", "B", "C", "D", "F", "G", "H", "I", "J"],
			primaryKey: [],
			dependencies: [
				{ left: ["B", "C", "D"], right: ["A", "F", "G"] },
				{ left: ["C", "D"], right: ["H", "I"] },
				{ left: ["I"], right: ["H"] },
				{ left: ["H"], right: ["J"] },
			],
		},
		expected: [
			{
				name: "TABLE_B_C_D",
				attributes: ["B", "C", "D", "A", "F", "G"],
				primaryKey: ["B", "C", "D"],
				foreignKeys: ["C, D -> TABLE_C_D"],
				dependencies: [{ left: ["B", "C", "D"], right: ["A", "F", "G"] }],
			},
			{
				name: "TABLE_C_D",
				attributes: ["C", "D", "I"],
				primaryKey: ["C", "D"],
				foreignKeys: ["I -> TABLE_I"],
				dependencies: [{ left: ["C", "D"], right: ["I"] }],
			},
			{
				name: "TABLE_I",
				attributes: ["I", "H"],
				primaryKey: ["I"],
				foreignKeys: ["H -> TABLE_H"],
				dependencies: [{ left: ["I"], right: ["H"] }],
			},
			{
				name: "TABLE_H",
				attributes: ["H", "J"],
				primaryKey: ["H"],
				foreignKeys: [],
				dependencies: [{ left: ["H"], right: ["J"] }],
			},
		],
	},
	{
		title: "TABLE (A-E): A -> D -> C, com relação da chave (A, B)",
		table: {
			name: "TABLE",
			attributes: ["A", "B", "C", "D", "E"],
			primaryKey: ["A", "B"],
			dependencies: [
				{ left: ["A"], right: ["C", "D"] },
				{ left: ["B"], right: ["E"] },
				{ left: ["D"], right: ["C"] },
			],
		},
		expected: [
			{
				name: "TABLE_A_B",
				attributes: ["A", "B"],
				primaryKey: ["A", "B"],
				foreignKeys: ["A -> TABLE_A", "B -> TABLE_B"],
				dependencies: [],
			},
			{
				name: "TABLE_A",
				attributes: ["A", "D"],
				primaryKey: ["A"],
				foreignKeys: ["D -> TABLE_D"],
				dependencies: [{ left: ["A"], right: ["D"] }],
			},
			{
				name: "TABLE_B",
				attributes: ["B", "E"],
				primaryKey: ["B"],
				foreignKeys: [],
				dependencies: [{ left: ["B"], right: ["E"] }],
			},
			{
				name: "TABLE_D",
				attributes: ["D", "C"],
				primaryKey: ["D"],
				foreignKeys: [],
				dependencies: [{ left: ["D"], right: ["C"] }],
			},
		],
	},
	{
		title: "TABLE (X,Y,Z,W,K): já está em 3NF (X -> Z tem Z primo), não divide",
		table: {
			name: "TABLE",
			attributes: ["X", "Y", "Z", "W", "K"],
			primaryKey: ["Z", "W"],
			dependencies: [
				{ left: ["X"], right: ["Z"] },
				{ left: ["Z", "W"], right: ["X", "Y", "K"] },
			],
		},
		expected: [
			{
				name: "TABLE",
				attributes: ["X", "Y", "Z", "W", "K"],
				primaryKey: ["Z", "W"],
				foreignKeys: [],
				dependencies: [
					{ left: ["X"], right: ["Z"] },
					{ left: ["Z", "W"], right: ["X", "Y", "K"] },
				],
			},
		],
	},
];

/* ───────────── testes ───────────── */

describe("normalizeTable", () => {
	for (const { title, table, expected } of cases) {
		it(title, () => {
			const actual = [...normalizeTable(table)].sort(byName);
			const wanted = [...expected].sort(byName);

			expect(actual.map(shape)).toEqual(wanted.map(shape));

			actual.forEach((relation, index) => {
				expect(
					equivalent(
						relation.dependencies ?? [],
						wanted[index].dependencies ?? [],
					),
				).toBe(true);
			});
		});
	}
});

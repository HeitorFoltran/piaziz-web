import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { FichaForm, type FichaFormSubmitData } from "./FichaForm";
import { fichaToFormState } from "./ficha-form-state";

function renderForm(props: Partial<React.ComponentProps<typeof FichaForm>> = {}) {
  const onSubmit = vi.fn<(data: FichaFormSubmitData) => void>();
  render(
    <MemoryRouter>
      <FichaForm status="ATIVO" onSubmit={onSubmit} submitting={false} submitLabel="Salvar" cancelHref="/" {...props} />
    </MemoryRouter>,
  );
  const salvar = () => {
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    return onSubmit.mock.calls[onSubmit.mock.calls.length - 1][0];
  };
  return { onSubmit, salvar };
}

describe("FichaForm - Parte A", () => {
  it("pergunta se tem com quem deixar os filhos, não se eles precisam de supervisão", () => {
    renderForm();
    expect(screen.getByText("Se tenho filhos e eles precisam de supervisão, tenho com quem deixar eles?")).toBeInTheDocument();
    expect(screen.queryByText("Meus filhos precisam de supervisão?")).not.toBeInTheDocument();
  });

  it("mostra o campo do Outro só com OUTRO marcado e não manda a descrição sem ele", () => {
    const { salvar } = renderForm();
    expect(screen.queryByLabelText("Outro, qual?")).not.toBeInTheDocument();

    const outro = screen.getByRole("checkbox", { name: "Outro" });
    fireEvent.click(outro);
    fireEvent.change(screen.getByLabelText("Outro, qual?"), { target: { value: "Documentos" } });
    expect(salvar().ficha).toMatchObject({ necessidadesImediatas: ["OUTRO"], necessidadeOutraDescricao: "Documentos" });

    fireEvent.click(outro);
    expect(screen.queryByLabelText("Outro, qual?")).not.toBeInTheDocument();
    const { ficha } = salvar();
    expect(ficha.necessidadesImediatas).toEqual([]);
    expect(ficha.necessidadeOutraDescricao).toBeUndefined();
  });

  it("abre ficha antiga com descrição e sem OUTRO já com OUTRO marcado", () => {
    renderForm({
      initialFicha: fichaToFormState({ nome: "Maria", cpf: "", necessidadesImediatas: ["APOIO_MORADIA"], necessidadeOutraDescricao: "Documentos" }),
    });
    expect(screen.getByRole("checkbox", { name: "Outro" })).toBeChecked();
    expect(screen.getByLabelText("Outro, qual?")).toHaveValue("Documentos");
  });
});

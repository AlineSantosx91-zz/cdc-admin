import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './componentes/InputCustomizado';
import ButtonCustomizado from './componentes/ButtonCustomizado';
import PubSub from 'pubsub-js';
import TratadorErros from './TratadorErros';
class FormularioLivro extends Component {

  constructor() {
    super();
    this.state = { titulo: '', preco: '', autor: null };
    this.enviaForm = this.enviaForm.bind(this);
    this.setTitulo = this.setTitulo.bind(this);
    this.setPreco = this.setPreco.bind(this);
    this.setAutor = this.setAutor.bind(this);

  }

  enviaForm(evento) {
    evento.preventDefault();
    $.ajax({
      url: 'http://localhost:8080/livros',
      contentType: 'application/json',
      dataType: 'json',
      type: 'post',
      data: JSON.stringify({ titulo: this.state.titulo, preco: this.state.preco, autor: this.state.autor }),
      success: function (novaListagem) {
        PubSub.publish('atualiza-lista-livros', novaListagem);
        this.setState({ titulo: '', preco: '', autor: null });
      }.bind(this),
      error: function (resposta) {
        console.log(resposta);
        if (resposta.status === 400) {
          new TratadorErros().publicaErros(resposta.responseJSON);
        }
      },
      beforeSend: function () {
        PubSub.publish("limpa-erros", {});
      }
    });
  }

  setTitulo(evento) {
    this.setState({ titulo: evento.target.value });
  }

  setPreco(evento) {
    this.setState({ preco: evento.target.value });
  }

  setAutor(evento){
    debugger;
    // this.setState({autor:JSON.parse(event.target.value)});
    this.setState({autor: this.props.autores[evento.target.value]})

  }

  render() {
    return (

      <div className="pure-form pure-form-aligned">
        <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
          <InputCustomizado id="titulo" type="text" name="titulo" value={this.state.titulo} onChange={this.setTitulo} label="Título" />
          <InputCustomizado id="preco" type="text" name="preco" value={this.state.preco} onChange={this.setPreco} label="Preço" />

          <div className="pure-control-group">
          <label htmlFor="autor">Autor</label>
          <select name="autor" id="autor" onChange={this.setAutor}>
              <option>Selecione autor</option>
              {
                  this.props.autores.map(function(autor, index){
                      return <option key={index} value={index}>{autor.nome}</option>
                  })
              }
            </select>
          </div>

          <ButtonCustomizado className="pure-button pure-button-primary" type="submit" label="Gravar" />
        </form>
      </div>

    );
  }
}

class TabelaLivros extends Component {

  render() {
    return (
      <div>
        <table className="pure-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Preço</th>
              <th>Autor</th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.lista.map(function (livro) {
                return (
                  <tr key={livro.id}>
                    <td>{livro.titulo}</td>
                    <td>{livro.preco}</td>
                    <td>{livro.autor.nome}</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    );
  }
}

export default class LivroBox extends Component {

  constructor() {
    super();
    this.state = { lista: [], autores: [] };
  }

  componentDidMount() {
    $.ajax({
      url: "http://localhost:8080/livros",
      dataType: 'json',
      success: function (resposta) {
        this.setState({ lista: resposta });
      }.bind(this)
    }
    );
    $.ajax({
      url:"http://localhost:8080/autores",
      dataType: 'json',
      success:function(resposta){
        this.setState({autores: resposta});
      }.bind(this)
    }
  ); 

    PubSub.subscribe('atualiza-lista-livros', function (topico, novaLista) {
      // this.setState({lista:novaLista});
      this.componentDidMount();
    }.bind(this));
  }


  render() {
    return (
      <div>
        <div className="header">
          <h1>Cadastro de Livros</h1>
        </div>
        <div className="content" id="content">
          <FormularioLivro autores={this.state.autores}/>
          <TabelaLivros lista={this.state.lista} />
        </div>

      </div>
    );
  }
}
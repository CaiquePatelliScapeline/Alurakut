import React from 'react';
import nookies from 'nookies';
import jwt from 'jsonwebtoken';
import MainGrid from '../src/components/MainGrid';
import Box from '../src/components/Box';
import {AlurakutMenu, AlurakutProfileSidebarMenuDefault, OrkutNostalgicIconSet} from "../src/lib/AlurakutCommons"
import { ProfileRelationsBoxWrapper } from '../src/components/ProfileRelations';

function ProfileSidebar(props){
  return(
    <Box as="aside">
      <a href={`/users/${props.githubUser}`} key={props.githubUser} >
        <img src={`https://github.com/${props.githubUser}.png`} style={{borderRadius: '8px'}} />
        <hr />

        <p>
          <a className="boxLink" href={`https://github.com/${props.githubUser}`}>
            @{props.githubUser}
          </a>
        </p>
        <hr />

        <AlurakutProfileSidebarMenuDefault />
      </a>
    </Box>
  );
}

function ProfileRelationsBox(props){
  return(
    <ProfileRelationsBoxWrapper>
      <h2 className="smallTitle">
        {props.title} ({props.items.length})
      </h2>

      <ul>
        {/* {seguidores.map((itemAtual) => {
          return(
            <li key={itemAtual}>
              <a href={`https://github.com${itemAtual}`}>
                <img src={itemAtual} alt="" />
                <span>{itemAtual}</span>
              </a>
            </li>
          ); 
        })} */}
      </ul>
    </ProfileRelationsBoxWrapper>
  );
}

export default function Home(props) {
  const githubUser = props.githubUser;
  const pessoasFavoritas = ['rafaballerini', 'juunegreiros', 'peas', 'omariosouto', 'marcobrunodev', 'felipefialho' ];
  const [comunidades, setComunidades] = React.useState([]);
  const [seguidores, setSeguidores] = React.useState([]);


  React.useEffect(function() {
    fetch(`https://api.github.com/users/${githubUser}/followers`)
    .then(function (respostaDoServidor) {
      return respostaDoServidor.json();
    })
    .then(function(respostaCompleta) {
      setSeguidores(respostaCompleta);
    });

    //API GraphQL
    fetch('https://graphql.datocms.com/', {
      method: 'POST',
      headers: {
        'Authorization': 'e42ba08f2df1b657f841fffa94ca31',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        "query": `query {
          allCommunities{
            id
            title
            imageUrl
            linkUrl
            creatorSlug
          }
        }`
      }),
    })
    .then((response) => response.json())
    .then((respostaCompleta) => {
      const comunidadesApiDato = respostaCompleta.data.allCommunities;
      setComunidades(comunidadesApiDato);
    })
  }, [])

  return (
    // div vasia
    <>
      <AlurakutMenu />
      <MainGrid>
        <div className="profileArea" style={{gridArea: 'profileArea'}}>
          <ProfileSidebar githubUser={githubUser} />
        </div>
        <div className="welcomeArea" style={{gridArea: 'welcomeArea'}}>
          <Box>
            <h1 className="title">
              Bem vindo(a)
            </h1>

            <OrkutNostalgicIconSet/>
          </Box>

          <Box>
            <h2 className="subTitle" >O que você deseja fazer?</h2>
            <form onSubmit={(e) => {
              e.preventDefault(); //para o refresh

              const dadosForm = new FormData(e.target);
              const comunidade = {
                title: dadosForm.get('title'),
                imageUrl: dadosForm.get('image'),
                linkUrl: dadosForm.get('url'),
                creatorSlug: githubUser,
              }

              fetch('/api/comunidades', {
                method: 'POST',
                headers:{
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(comunidade)
              })
              .then(async (response) => {
                const dados = await response.json();
                const comunidade = dados.registro;
                setComunidades([...comunidades, comunidade]);
              });
            }}>
              <div>
                <input 
                  placeholder="Qual vai ser o nome da sua comunidade?" 
                  name="title" 
                  aria-label="Qual vai ser o nome da sua comunidade?"
                  type="text"
                />
              </div>
              <div>
                <input 
                  placeholder="Coloque uma URL para usarmos de capa" 
                  name="image" 
                  aria-label="Coloque uma URL para usarmos de capa"
                />
              </div>
              <div>
                <input 
                  placeholder="Coloque uma URL para a comunidade" 
                  name="url" 
                  aria-label="Coloque uma URL para a comunidade"
                />
              </div>

              <button>
                Criar Comunidade
              </button>
            </form>
          </Box>
        </div>
        <div className="profileRelationsArea" style={{gridArea: 'profileRelationsArea'}}>
          <ProfileRelationsBox title="Seguidores" items={seguidores}/>
          <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">
              Comunidades ({comunidades.length})
            </h2>

            <ul>
              {comunidades.slice(0,24).map((itemAtual) => {
                return(
                  <li key={itemAtual.id}>
                    <a href={`/users/${itemAtual.title}`}>
                      <img src={itemAtual.imageUrl} alt="" />
                      <span>{itemAtual.title}</span>
                    </a>
                  </li>
                ); 
              })}
            </ul>
          </ProfileRelationsBoxWrapper>
          <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">
              Pessoas da Comunidade ({pessoasFavoritas.length})
            </h2>

            <ul>
              {pessoasFavoritas.slice(0,24).map((itemAtual) => {
                return(
                  <li key={itemAtual}>
                    <a href={`/users/${itemAtual}`}>
                      <img src={`https://github.com/${itemAtual}.png`} alt="" />
                      <span>{itemAtual}</span>
                    </a>
                  </li>
                ); 
              })}
            </ul>
          </ProfileRelationsBoxWrapper>
        </div>
      </MainGrid>
    </>
  );
}

export async function getServerSideProps(context){
  const cookies = nookies.get(context);
  const token = cookies.USER_TOKEN;
  
  const { isAuthenticated } = await fetch('https://alurakut.vercel.app/api/auth', {
    headers: {
      Authorization: token
    }
  })
  .then((resposta) => resposta.json());
  
  if(!isAuthenticated){
    return{
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }
  
  const {githubUser} = jwt.decode(token);

  return{
    props: {
      githubUser,
    },
  }
}
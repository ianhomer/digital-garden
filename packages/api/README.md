# GraphQL API for digital garden

Start server

    pnpm start

Test with:

    curl -H "Content-Type: application/json" \
        http://localhost:4000/graphql  \
        -d '{"query":"query{hello}"}'

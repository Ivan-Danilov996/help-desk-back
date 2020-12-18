

class Ticket {
    constructor(name, status, created, id = Date.now()) {
        this.id = id,
            this.name = name,
            this.status = status,
            this.created = created
    }
}

class TicketFull {
    constructor(name, description, status, created, id = Date.now()) {
        this.id = id,
            this.name = name,
            this.description = description,
            this.status = status,
            this.created = created
    }
}

const tickets = [];
const ticketsFull = []

const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const app = new Koa();


app.use(koaBody({
    multipart: true,
    urlencoded: true
}));


app.use(async (ctx, next) => {
    const origin = ctx.request.get('Origin');
    if (!origin) {
        return await next();
    }
    const headers = { 'Access-Control-Allow-Origin': '*', };
    if (ctx.request.method !== 'OPTIONS') {
        ctx.response.set({ ...headers });
        try {
            return await next();
        } catch (e) {
            e.headers = { ...e.headers, ...headers };
            throw e;
        }
    }
    if (ctx.request.get('Access-Control-Request-Method')) {
        ctx.response.set({
            ...headers,
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
        });
        if (ctx.request.get('Access-Control-Request-Headers')) {
            ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Allow-Request-Headers'));
        }
        ctx.response.status = 204; // No content
    }

});

app.use(async ctx => {

    const body = ctx.request.querystring
    console.log(body)

    if (body.includes('allTickets')) {
        ctx.response.body = tickets;
        return;
    } else if (body.includes('ticketById')) {
        const [,data] = body.split('&')
        const [, dataId] = data.split('=')
        ticketsFull.forEach(element => {
            if (element.id === parseInt(dataId)) {
                ctx.response.body = element
            }
        });
        return;
    } else if (body.includes('checkTicket')) {
        const [,data] = body.split('&')
        const [, dataId] = data.split('=')
        ticketsFull.forEach(element => {
            if (element.status) {
                element.status = ''
            } else {
                element.status = 1
            }
        });
        tickets.forEach(element => {
            if (element.id === parseInt(dataId)) {
                if (element.status) {
                    element.status = ''
                } else {
                    element.status = 1
                }
            }
        });
        console.log(tickets)
        ctx.response.body = tickets
        ctx.response.status = 200;
        return;
    } else if (body.includes('createTicket')) {
        const data = ctx.request.body
        tickets.forEach((ticket, index) => {
            if (ticket.id === parseInt(data.id)) {
                tickets.splice(index, 1)
            }
        })
        ticketsFull.forEach((ticket, index) => {
            if (ticket.id === parseInt(data.id)) {
                tickets.splice(index, 1)
            }
        })
        tickets.push(new Ticket(data.name, data.status, data.created))
        ticketsFull.push(new TicketFull(data.name, data.description, data.status, data.created))
        console.log(data.name)
        ctx.response.status = 200;
        ctx.response.body = tickets;
        return;
    } else if (body.includes('deleteTicket')) {
        console.log(body)
        const [,data] = body.split('&')
        const [, dataId] = data.split('=')
        tickets.forEach((ticket, index) => {
            if (ticket.id === parseInt(dataId)) {
                tickets.splice(index, 1)
            }
        })
        ticketsFull.forEach((ticket, index) => {
            if (ticket.id === parseInt(dataId)) {
                tickets.splice(index, 1)
            }
        })
        ctx.response.status = 200;
        ctx.response.body = tickets;
        return;
    } else {
        ctx.response.status = 404;
        return;
    }
});
const port = process.env.PORT || 7070;
const server = http.createServer(app.callback()).listen(port)




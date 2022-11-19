let canv = document.querySelector("canvas");
let c = canv.getContext("2d");

canv.width = innerWidth;
canv.height = innerHeight;

korekta_x = 0;
korekta_y = 0;

let tryb = "gra";

tlo =
{
    x : 0,
    r : 0,
    g : 0,
    b : 0
}


stop_game = () => {};

wybor_broni = (typ) =>
{
    let bron;
    switch(typ)
    {
        case "start":
            bron = {
                wielkosc_pocisku: 5,
                zasieg: 400,
                color:"black",
                damage: 10,
                odnowa: 1000,
                odstep_pocisk: 300, // MILISEKUNDY
                strzaly: 1,
                predkosc: 1,
                ilosc: 1
            }
            break;
            case "start2":
                bron = {
                    wielkosc_pocisku: 5,
                    zasieg: 750,
                    color:"red",
                    damage: 60,
                    odstep_pocisk: 300, // MILISEKUNDY
                    odnowa: 1000,
                    predkosc: 1,
                    ilosc: 1
            }
            break;
            case "electro":
            bron = {
                wielkosc_pocisku: 4,
                zasieg: 400,
                color:"darkblue",
                damage: 2,
                odstep_pocisk: 20, // MILISEKUNDY
                odnowa: 1000,
                predkosc: 30,
                ilosc: 20
            }
            break;
            case "electro2":
                bron = {
                    wielkosc_pocisku: 4,
                    zasieg: 500,
                    color:"darkblue",
                    damage: 3,
                    odstep_pocisk: 20, // MILISEKUNDY
                    odnowa: 1000,
                    predkosc: 30,
                    ilosc: 20
                }
             break;
             case "electro3":
                    bron = {
                        wielkosc_pocisku: 4,
                        zasieg: 600,
                        color:"darkblue",
                        damage: 4,
                        odstep_pocisk: 20, // MILISEKUNDY
                        odnowa: 1000,
                        predkosc: 30,
                        ilosc: 20
                    }
            break;
        default:
            bron = {
                wielkosc_pocisku: 0,
                zasieg: 0,
                color: 0,
                damage: 0,
                odstep_pocisk: 0, // MILISEKUNDY
                odnowa: 0,
                strzaly: 0,
                predkosc: 0,
                ilosc: 0
            }
            break;
    }

    return bron;
}

health_color = (health) =>
{
    if(health >= 50)
    {
        return "yellow";
    }
    else if(health < 50 && health >=25)
    {
        return "orange";
    }else if(health < 25)
    {
        return "red";
    }

}


rysuj_tlo = () =>
{



    c.clearRect(0, 0, canv.width, canv.height)
    c.save()
    let grad = c.createLinearGradient(0, 0, canv.width, canv.height)
    grad.addColorStop(0, "grey")
    if(Math.cos(tlo.x) > 0)
    {
        grad.addColorStop(Math.cos(tlo.x), "white")
    }
    else
    {
        grad.addColorStop(-Math.cos(tlo.x), "white")
    }
    grad.addColorStop(1, "lightgrey")
    c.fillStyle = grad;
    c.fillRect(0, 0, canv.width, canv.height)
    c.fill()
    c.restore()
}


dystans = (obiekt1_x, obiekt1_y, obiekt2_x, obiekt2_y) =>
{
    let distance = Math.sqrt((obiekt1_x - obiekt2_x) * (obiekt1_x - obiekt2_x) + (obiekt1_y - obiekt2_y) * (obiekt1_y - obiekt2_y));
    return distance;
}

kolizja_kolo_kolo = (dystans, promien1, promien2) =>
{
    if(dystans < promien1 + promien2)
    return true
    else
    return false
}

stworz_particles = (x, y, color) =>
{
    Particless.push(new Particles({position: {x: x, y: y}}, color))
    let random = Math.random() * 1000 + 300;
    setTimeout(del = () =>
    {
       Particless.splice(Particless.length-1, 1) 
    }, random)
}


class Cam
{
    constructor()
    {
        this.x = canv.width /2  ;
        this.y = canv.height /2;
    }
}

class Particles
{
    constructor({position}, color)
    {
        this.position = position;
        this.color = color;
        this.losuj_x = Math.random() * 1 - 0.5;
        this.losuj_y = Math.random() * 1 - 0.5;

    }


    draw =() =>
    {
        c.save();
        c.beginPath();
        c.fillStyle = this.color;
        c.arc(this.position.x,this.position.y, 2, 0, Math.PI*2, false);
        c.fill();
        c.closePath();
        c.restore();
    }

    update = () =>
    {
        this.position.x = this.position.x + this.losuj_x;
        this.position.y = this.position.y + this.losuj_y;
        this.draw();
    }
}

class Pocisk
{
    constructor({position, predkosc, target}, radius, typ, zasieg, exhaust, damage, color, player, predkosc_pocisku)
    {
        this.usun = 0;
        this.position = position;
        this.predkosc = predkosc;
        this.target = target;
        this.radius = radius;
        this.typ = typ;
        this.zasieg = zasieg;
        this.exhaust = exhaust;
        this.damage = damage;
        this.color = color;
        this.player = player;
        this.position_save = position;
        this.predkosc_pocisku = predkosc_pocisku;
        this.efekt = 0;
        setTimeout(() =>
        {
            this.usun = 1;
        }, (this.zasieg/this.predkosc_pocisku)*10)
    }

    draw = () =>
    {
        c.save();
        c.beginPath();
        c.fillStyle = this.color;
        c.arc(this.position.x, this.position.y, this.radius, 0,  2* Math.PI, false) 
        c.fill();
        c.closePath();
        c.restore();
    }

    draw_prostokat = () =>
    {
        c.beginPath()
        c.save()
        c.translate(this.position.x, this.position.y)
        c.moveTo(0, 0 - this.radius)
        for(let i = 0; i < 5; i++)
        {
            c.rotate(Math.PI/5)
            c.lineTo(0, 0 - (this.radius*0.3))
            c.rotate(Math.PI/5)
            c.lineTo(0, 0 - this.radius)
        }
        c.fillstyle = this.color;
        c.strokeStyle = this.color;
        c.fill()
        c.stroke()
        c.restore()
        c.closePath()
    

    }


    update = () =>
    {
        if(this.typ == "electro")
        {
            this.draw_prostokat();
            this.efekt++;
            this.position.x =+ this.position.x + this.predkosc.x + Math.cos(this.efekt)*8;
            this.position.y =+ this.position.y + this.predkosc.y  + Math.sin(this.efekt)*8;
        }


        if(this.typ == "start")
        {
            this.draw();
            this.position.x =+ this.position.x + this.predkosc.x;
            this.position.y =+ this.position.y + this.predkosc.y;
        }
       
     
        
       
        
        
    }

}


class Bot
{
    constructor({position, wartosc}, color, radius, max_health, predkosc, bron_typ)
    {
        this.position = position;
        this.color = color;
        this.radius = radius;
        this.obrot = 0;
        this.health = max_health;
        this.max_health = max_health;
        this.exhaust_kolizja = 0;
        this.predkosc_mnoznik = predkosc;
        this.target = 
        {
            x: false,
            y: false
        }
        this.predkosc =
        {
            x: false,
            y: false,
        }
        this.wartosc = wartosc;
        this.bron_typ = bron_typ;
        this.bron = wybor_broni(this.bron_typ);

       
    }



    ustaw_target = (target_x, target_y) =>
    {
        this.target.x = target_x;
        this.target.y = target_y;
    }

    atak_b = () =>
    {
      
        if(this.bron_typ != 0 && this.bron.strzaly > 0)
        {
            this.bron.strzaly =- 1;
            setTimeout(()=>
            {
                this.bron.strzaly =+ 1;
            }, this.bron.odnowa)
            
            const angle = Math.atan2(this.target.y - this.position.y, this.target.x - this.position.x)

            const velocity = {
                    x: Math.cos(angle) * this.bron.predkosc,
                    y: Math.sin(angle) * this.bron.predkosc
                }
    
            Pociski.push(new Pocisk({position:{x: this.position.x, y: this.position.y}, predkosc:{x: velocity.x,y: velocity.y}, target:{x: this.target.x, y: this.target.y}}, 7, "start", 600, 0, this.bron.damage, this.color, 0, this.bron.predkosc))
        }
      
    }

    move = () =>
    {
        const angle = Math.atan2(this.target.y - this.position.y, this.target.x - this.position.x)

        const velocity = {
                x: Math.cos(angle) *this.predkosc_mnoznik,
                y: Math.sin(angle) *this.predkosc_mnoznik
            }
        this.predkosc.x = velocity.x;
        this.predkosc.y = velocity.y;

       
    }

    draw = () =>
    {
        c.save();
        c.beginPath();
        c.fillStyle = "yellow";
        c.arc(this.position.x, this.position.y, this.radius, 0, 2* Math.PI, false)
        c.fillRect(this.position.x -this.radius, this.position.y - this.radius*1.5, this.radius *2* (this.health/this.max_health), this.radius/4)
        let grad2 = c.createLinearGradient(this.position.x - this.radius, this.position.y - this.radius, this.position.x + this.radius, this.position.y + this.radius);
        grad2.addColorStop(0, "white")
        grad2.addColorStop(0.5, this.color)
        grad2.addColorStop(0.8, this.color)
        c.fillStyle = grad2;
        c.fill();
        c.closePath();
        c.restore();
    }

    draw_hp = () =>
    {
        c.save();
        c.beginPath();
        c.font = "15px Arial";
        c.fillStyle = health_color(this.health/this.max_health*100);
        c.fillText(this.health, this.position.x-this.radius/2, this.position.y-this.radius*2);
        c.fillRect(this.position.x -this.radius, this.position.y - this.radius*1.5, this.radius *2* (this.health/this.max_health), this.radius/4)
        c.fill();
        c.closePath();
        c.restore();
    }

    update = () =>
    {
        this.draw();
        if(this.health > 0)
        this.draw_hp();
        this.position.x = this.position.x + this.predkosc.x;
        this.position.y = this.position.y + this.predkosc.y;
    }


}



class Player
{
    constructor({position}, color, radius)
    {
        this.position = position;
        this.color = color;
        this.radius = radius;
        this.obrot = 0;
        this.ulepszenia = [];
        this.t = 0;
        this.Keys = 
        {
            w :{ pressed: false},
            a :{ pressed: false},
            s :{ pressed: false},
            d :{ pressed: false}
        }
        this.predkosc = 
        {
            x:0,
            y:0
        };
        this.last_key = 0;
        this.target =
        {
            x: false,
            y: false
        }
        this.health = 100;
        this.max_health = 100;
        this.pole_ochronne = 100;
        this.max_pole_ochronne = 100;

        this.punkty = 0;
        this.gold = 0;
        this.typ_broni = "electro";
        this.bron = wybor_broni(this.typ_broni);
        this.kolo =2;
    }

    skill = (e) =>
    {   
        switch(e)
        {
            case 86:
                this.target_f(15, 700, 50, "start2", "red", 1)
            break;
            default:
                break;
        }
     
    }

    target_f = (wielkosc_pocisku, zasieg, damage, typ, color, predkosc) =>
    {
        if(typ == "start2")
        this.bron.ilosc = 1;
        if(this.target.x != false && this.target.y != false )
        {
            for(let i = 0; i<this.bron.ilosc ; i++)
            {   setTimeout(() =>
                {
                     
                    const angle = Math.atan2(this.target.y - this.position.y, this.target.x - this.position.x)

                    const velocity = {
                    x: Math.cos(angle) *predkosc, 
                    y: Math.sin(angle) *predkosc
                }
                    Pociski.push(new Pocisk({position:{x: this.position.x, y: this.position.y}, predkosc:{x: velocity.x,y: velocity.y}, target:{x: this.target.x, y: this.target.y}}, wielkosc_pocisku, typ, zasieg, 0, damage, color, 1, this.bron.predkosc))
                }, this.bron.odstep_pocisk*i)
           
            }
            
        }
    }

    move = (e) =>
    {
        switch(e)
        {
            case 65:
            this.predkosc.x = -5;
            this.Keys.a.pressed = true;
            this.last_key = "a";
            // lewo
            break;
            case 68:
            this.predkosc.x = 5;
            this.Keys.d.pressed = true;
            this.last_key = "d";
            // prawo
            break;
            case 87:
            this.predkosc.y = -5;
            this.Keys.w.pressed = true;
            this.last_key = "w";
            // gora
            break;
            case 83:
            this.predkosc.y = 5;
            this.Keys.s.pressed = true;
            this.last_key = "s";
            // dol
            break;
            default:
                break;
        }
    }

    stop_move = (e) =>
    {
        switch(e)
        {
            case 65:
            this.predkosc.x = 0;
            this.Keys.a.pressed = false;
            // lewo
            break;
            case 68:
            this.predkosc.x = 0;
            this.Keys.d.pressed = false;
            // prawo
            break;
            case 87:
            this.predkosc.y = 0;
            this.Keys.w.pressed = false;
            // gora
            break;
            case 83:
            this.predkosc.y = 0;
            this.Keys.s.pressed = false;
            // dol
            break;
            default:
                break;
        }
    }

    obrot_f = (mouse_x, mouse_y) =>
    {
        this.target.x = mouse_x;
        this.target.y = mouse_y;
        let distance = Math.sqrt((mouse_x - this.position.x) * (mouse_x - this.position.x) + (mouse_y - this.position.y) * (mouse_y - this.position.y));
        const angle = Math.atan2(mouse_y - this.position.y, mouse_x - this.position.x)

            const velocity = {
                 x: Math.cos(angle), 
                 y: Math.sin(angle)
                }

                    if(this.angle > 0)
                    {
                       this.obrot = -angle*2*58-90;
                    }
                    else
                       this.obrot = angle*58-90;
    }

    draw = () =>
    {
        c.save();
        c.beginPath();
        c.fillStyle = "yellow";
        c.arc(this.position.x, this.position.y, this.radius, 0, this.kolo+2* Math.PI, false) 
        c.fillRect(this.position.x -this.radius, this.position.y - this.radius*1.5, this.radius *2* (this.health/this.max_health), this.radius/4)
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
        c.restore();
    }

    draw_bron = () =>
    {
        c.save();
        c.beginPath();
        c.translate(this.position.x, this.position.y);
        c.rotate(this.obrot * Math.PI*2/360);
        c.translate(-this.position.x, -this.position.y);
        c.fillStyle = this.color;
        c.fillRect(this.position.x-10, this.position.y, 20, 50)
      
        c.fill();
        c.closePath();
        c.restore();
    }

    draw_hp = () =>
    {
        c.save();
        c.beginPath();
        c.fillStyle = health_color(this.health/this.max_health*100);
        c.fillRect(this.position.x -this.radius, this.position.y - this.radius*1.5, this.radius *2* (this.health/this.max_health), this.radius/4)
        c.fill();
        c.closePath();
        c.restore();
    }

    draw_pole_ochronne = () =>
    {
        c.save();
        c.beginPath();
        c.fillStyle = "grey";
        c.fillRect(this.position.x -this.radius, this.position.y - this.radius*2, this.radius *2* (this.pole_ochronne/this.max_pole_ochronne), this.radius/4)
        c.fill();
        c.closePath();
        c.restore();
    }

   

    update = () =>
    {
        this.draw_bron();
        this.draw();
        if(this.health > 0)
        this.draw_hp();
        if(this.pole_ochronne > 0)
        this.draw_pole_ochronne();
        this.position.x = this.position.x + this.predkosc.x;
        this.position.y = this.position.y + this.predkosc.y;
       // this.t = this.t+0.1;
        //player.radius += Math.sin(this.t)*0.1;
        //c.translate(-this.predkosc.x, -this.predkosc.y)
        //korekta_x = korekta_x + this.predkosc.x;
        //korekta_y = korekta_y + this.predkosc.y;
    }

}

class Kratka
{
    constructor({position, colorRGBA}, color)
    {
        this.position = position;
        this.colorRGBA = colorRGBA;
        this.color = color;
        this.szerokosc = 50;
        this.wysokosc = 50;
        this.color_save = color; 
    }
    

    draw = () =>
    {

        c.save();
        c.beginPath();
        let grad1 = c.createLinearGradient(this.position.x, this.position.y, this.position.x + this.szerokosc, this.position.y + this.wysokosc)
        grad1.addColorStop(0.6, this.color)
        grad1.addColorStop(0.8, 'rgba('+0+', '+100+','+ 255+','+0.9+')')
        c.fillStyle = this.color;
    
        c.fillRect(this.position.x, this.position.y, this.szerokosc, this.wysokosc)
        c.fill();
        c.closePath();
        c.restore();
        this.color = this.color_save;
    }

}

class Pasek
{
    constructor({position, rozmiar}, typ)
    {
        this.position = position;
        this.rozmiar = rozmiar;
        this.napis =
        {
            tresc : '',
            rysuj: false,
            szerokosc: 350,
            wysokosc: 100,
            rozmiar: 25
        };
        this.pasek =
        {
            szerokosc: 700,
            wysokosc: 200,
            stop: false
        }
        this.wybor = 0;
            switch(this.wybor)
            {
                case 1:
                    this.napis = "wybor nr 1";
                    break;
                default:
                     break;
            }
        this.typ = typ;
        this.RGBA = {
            r: 40,
            g: 20,
            b: 230,
            a: 0.4
        }

        this.on = 0;
    }

    draw_pasek = () =>
    {
        c.save();
        c.beginPath();
        let grad = c.createLinearGradient(this.position.x, this.position.y, this.pasek.szerokosc + innerWidth/3, innerHeight)
        grad.addColorStop(0.2, 'rgba('+120+', '+240+','+ 180+','+0.9+')')
        grad.addColorStop(0.5, 'rgba('+130+', '+240+','+ 190+','+0.9+')')
        grad.addColorStop(0.9, 'rgba('+135+', '+235+','+ 195+','+0.9+')')
        c.fillStyle = grad;
        c.strokeStyle ="black";
        c.lineWidth = "8";
        c.strokeRect(this.position.x, this.position.y, this.pasek.szerokosc, this.pasek.wysokosc)
        c.fillRect(this.position.x, this.position.y, this.pasek.szerokosc, this.pasek.wysokosc)
        c.stroke();
        c.fill();
        c.closePath();
        c.restore();

        c.save();
        c.beginPath();
        c.font = "20px Arial";
        c.fillStyle = "yellow";
        c.fillText("Health: " + player.health , innerWidth/3+25,  innerHeight-this.pasek.wysokosc+25);
        c.fill();
        c.closePath();
        c.restore();



        c.save();
        c.beginPath();
        c.font = "20px Arial";
        c.fillstyle ="white";
        c.fillText("Bron zasieg: " + player.bron.zasieg, innerWidth/3+25,  innerHeight-this.pasek.wysokosc+75);
        c.fill();
        c.closePath();
        c.restore();

        c.save();
        c.beginPath();
        c.font = "20px Arial";
        c.fillstyle ="white";
        c.fillText("Bron Typ: " + player.typ_broni, innerWidth/3+25,  innerHeight-this.pasek.wysokosc+100);
        c.fill();
        c.closePath();
        c.restore();

        c.save();
        c.beginPath();
        c.font = "20px Arial";
        c.fillstyle ="white";
        c.fillText("Bron damage: " + player.bron.damage* player.bron.ilosc, innerWidth/3+25,  innerHeight-this.pasek.wysokosc+125);
        c.fill();
        c.closePath();
        c.restore();

        c.save();
        c.beginPath();
        c.fillstyle = "white";
        c.font = "20px Arial";
        c.fillText("Score: " + player.punkty, innerWidth/3+25,  innerHeight-this.pasek.wysokosc+150);
        c.fill();
        c.closePath();
        c.restore();

        c.save();
        c.beginPath();
        c.font = "20px Arial";
        c.fillstyle ="white";
        c.fillText("Gold: " + player.gold, innerWidth/3+25,  innerHeight-this.pasek.wysokosc+175);
        c.fill();
        c.closePath();
        c.restore();
    }
    

    draw_pasek_1 = () =>
    {
        c.save();
        c.beginPath();
        let grad = c.createLinearGradient(this.position.x, this.position.y, this.position.x + this.rozmiar.szerokosc, this.position.y + this.rozmiar.wysokosc)
        grad.addColorStop(0.3, 'rgba('+0+', '+100+','+ 255+','+0.4+')')
        grad.addColorStop(0.96, 'rgba('+40+', '+100+','+ 255+','+0.4+')')
        grad.addColorStop(0.99, 'rgba('+75+', '+105+','+ 255+','+0.4+')')
        c.fillStyle = grad;
        c.fillRect(this.position.x, this.position.y, this.rozmiar.szerokosc, this.rozmiar.wysokosc)
        c.strokeRect(this.position.x, this.position.y, this.rozmiar.szerokosc, this.rozmiar.wysokosc)
        c.fill();
        c.closePath();
        c.restore();
    }

    draw_pasek_wybory = () =>
    {
        c.save();
        c.beginPath();
        //if(this.color === undefined)
        c.fillStyle = "rgba("+this.RGBA.a+", "+this.RGBA.g+", "+this.RGBA.b+", "+this.RGBA.a+")";
        //else
        //c.fillStyle = this.color;
        c.fillRect(this.position.x, this.position.y, this.rozmiar.szerokosc, this.rozmiar.wysokosc)
        c.strokeRect(this.position.x, this.position.y, this.rozmiar.szerokosc, this.rozmiar.wysokosc)
        c.fill();
        c.closePath();
        c.restore();
    }

    draw_napis = (mouse_x, mouse_y) =>
    {
       
        c.save();
        c.beginPath();
        c.fillStyle = "rgba(40, 170, 255, 0.8)";
        c.fillRect(mouse_x,  mouse_y, this.napis.szerokosc, this.napis.wysokosc)
        c.strokeStyle = "rgb(0, 70, 150, 0.8)"
        c.strokeRect(mouse_x,  mouse_y, this.napis.szerokosc, this.napis.wysokosc)
        c.fill();
        c.closePath();
        c.restore();

        c.save();
        c.beginPath();
        c.font = this.napis.rozmiar+'px Arial';
        c.fillstyle ="white";
        c.fillText(this.napis.tresc, mouse_x,  mouse_y);
        c.fill();
        c.closePath();
        c.restore();
        
    }

}

const Map = [
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    [  'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x','x', 'x', 'x', 'x', 'x', 'x'],
    ]

// --------------------------- TABLICE  --------------------------- TABLICE  --------------------------- TABLICE  --------------------------- TABLICE  --------------------------- TABLICE 

const Paski = [];
const Pociski = [];
const Kratki = [];
const player = new Player({position:{x:innerWidth/2, y:innerHeight/2}}, 'RGBA(255, 255, 255, 0.95)', 20)
const cam = new Cam();
const bot = [];
const Particless = [];
bot.push(new Bot({position:{x:400, y:600}, wartosc:{gold:10, punkty:50}}, "black", 20, 1, 0.3, 1)) ;


const Pasek_wybory = [];
const Pasek_wybory_glowny = [];
Paski.push(new Pasek({position:{x: innerWidth/3, y: innerHeight- 200}, rozmiar:{szerokosc: 200, wysokosc: 200}}));
Pasek_wybory_glowny.push(new Pasek({position:{x: Paski[0].position.x + 200, y: Paski[0].position.y + 10}, rozmiar:{szerokosc: 50, wysokosc: 50}}, "wynalazki"));
Pasek_wybory_glowny.push(new Pasek({position:{x: Paski[0].position.x + 250, y: Paski[0].position.y + 10}, rozmiar:{szerokosc: 50, wysokosc: 50}}, "budynek"));


Paski.push(new Pasek({position:{x: 0, y: 0}, rozmiar:{szerokosc: window.innerWidth , wysokosc: window.innerHeight}}));
Pasek_wybory.push(new Pasek({position:{x: Paski[1].position.x+10, y: Paski[1].position.y+20}, rozmiar:{szerokosc: 40, wysokosc: 40}}, "electro1"));
Pasek_wybory.push(new Pasek({position:{x: Paski[1].position.x+10, y: Paski[1].position.y+80}, rozmiar:{szerokosc: 40, wysokosc: 40}}, "electro2") );
Pasek_wybory.push(new Pasek({position:{x: Paski[1].position.x+10, y: Paski[1].position.y+140}, rozmiar:{szerokosc: 40, wysokosc: 40}}, "electro3"));
Pasek_wybory.push(new Pasek({position:{x: Paski[1].position.x+100, y: Paski[1].position.y+20}, rozmiar:{szerokosc: 40, wysokosc: 40}}, "shield1"));
Pasek_wybory.push(new Pasek({position:{x: Paski[1].rozmiar.szerokosc *0.95, y: Paski[1].position.y + 20}, rozmiar:{szerokosc: 40, wysokosc: 40}}, "exit"));

 /*for(let i = 0; i < 5; i++)
    for(let j = 0; j < 5; j++)
    {
        Kratki.push(new Kratka(0 + rozmiar.szerokosc* j, rozmiar.wysokosc + 0*i, rozmiar.szerokosc, rozmiar.wysokosc, "blue" ))
    }*/

// ---------------------- MAPA  ---------------------- MAPA  ---------------------- MAPA  ---------------------- MAPA  ---------------------- MAPA  ---------------------- MAPA  ---------------------- MAPA 
  
    Map.forEach((row, i) =>
    {    
            
            row.forEach((symbol, j) =>
            {    
              
                switch(symbol)
                {
                    case 'x':
                        let r = 4*i
                        let g = 5*i+5
                        let b = 10*i+100
                        let a = 0.9;
                        Kratki.push(new Kratka({position: {x: j*51, y: i*51}, color: {red: r, green: g, b: b,a: a}}, 'rgba('+r+', '+g+','+ b+','+a+')'));
                        break;
                    case '1':
               
                        Kratki.push(new Player({position:{x: j*51, y: i*51}}, "black", 20));
                        break;
                        default:
                            break;
                }
           
            })
        
    })




// ---------------------- SYSTEM KOLIZJI ---------------------- SYSTEM KOLIZJI ---------------------- SYSTEM KOLIZJI ---------------------- SYSTEM KOLIZJI ---------------------- SYSTEM KOLIZJI ---------------------- SYSTEM KOLIZJI 
kolizja = () =>
{
    bot.forEach((bot) =>
    {
    let distance =  dystans(player.position.x + player.predkosc.x,  player.position.y + player.predkosc.y , bot.position.x, bot.position.y)
     
        if(kolizja_kolo_kolo(distance, player.radius, bot.radius) && player.Keys.d.pressed == true)
        {
            console.log("kolizja")
            player.predkosc.x = 0;

        }
        if(kolizja_kolo_kolo(distance, player.radius, bot.radius)  && player.Keys.a.pressed == true)
        {
            console.log("kolizja")
            player.predkosc.x = 0;
        }
        if(kolizja_kolo_kolo(distance, player.radius, bot.radius)  && player.Keys.s.pressed == true)
        {
            console.log("kolizja")
            player.predkosc.y = 0;
        }
        if(kolizja_kolo_kolo(distance, player.radius, bot.radius)  && player.Keys.w.pressed == true)
        {
            console.log("kolizja")
            player.predkosc.y = 0;
        }

        
    Kratki.forEach((kratka) =>
    {
        
        if(bot.position.x + bot.radius >= kratka.position.x && bot.position.x - bot.radius <= kratka.position.x + kratka.szerokosc && bot.position.y + bot.radius >= kratka.position.y && bot.position.y - bot.radius <= kratka.position.y + kratka.wysokosc)
        {
            kratka.color = "black"
        }
            
    })

    let distance_bot = Math.sqrt((player.position.x + bot.predkosc.x - bot.position.x) * (player.position.x + bot.predkosc.x - bot.position.x) + (player.position.y + bot.predkosc.y - bot.position.y) * (player.position.y + bot.predkosc.y - bot.position.y));
        
    if(distance_bot < player.radius + bot.radius)
        {
            console.log("kolizja")
            bot.predkosc.y = 0;
            bot.predkosc.x = 0;
            
            if(bot.exhaust_kolizja == 0)
            {
                if(player.pole_ochronne > 0)
                player.pole_ochronne -= 10;
                else
                player.health -= 10;

                bot.exhaust_kolizja = 1;
                setTimeout(() =>
                {
                    bot.exhaust_kolizja = 0;
                }, 1000)
            }
          
        }
    
        if(Pociski.length> 0)
        {
            Pociski.forEach((pocisk, i)=>
            {
                if(pocisk.typ == "electro")
                { 
                    let distancee = dystans(pocisk.position.x + pocisk.radius/2, pocisk.position.y + pocisk.radius/2, bot.position.x ,bot.position.y)
                    if(kolizja_kolo_kolo(distancee, bot.radius, pocisk.radius))
                    {
                        
                       
                        bot.health = bot.health - pocisk.damage;
                        //stworz_particles(bot.position.x, bot.position.y, bot.color)
                        
                    }
                    if(pocisk.position.x >= pocisk.target.x - 2 && pocisk.position.x <= pocisk.target.x + 2 && pocisk.position.y >= pocisk.target.y - 2 && pocisk.position.y <= pocisk.target.y + 2 )
                    {
                        Pociski.splice(i, 1);
                    }
                }else
                {
            if(pocisk.player == 1)
            {
                let distance = Math.sqrt((pocisk.position.x + pocisk.predkosc.x - bot.position.x) * (pocisk.position.x + pocisk.predkosc.x - bot.position.x) + (pocisk.position.y + pocisk.predkosc.y - bot.position.y) * (pocisk.position.y + pocisk.predkosc.y - bot.position.y));
                if(distance < bot.radius + pocisk.radius)
                {   
                    //for(let i = 0; i < 10;  i++)
                    //stworz_particles(bot.position.x, bot.position.y, bot.color)
                    Pociski.splice(i, 1);
                    bot.health = bot.health - pocisk.damage;

                }
                
                let distance2 = Math.sqrt((pocisk.position.x - pocisk.target.x) * (pocisk.position.x - pocisk.target.x) + (pocisk.position.y - pocisk.target.y) * (pocisk.position.y - pocisk.target.y));
                
            }if(pocisk.player == 0)
            {
                let distance = Math.sqrt((pocisk.position.x + pocisk.predkosc.x - player.position.x) * (pocisk.position.x + pocisk.predkosc.x - player.position.x) + (pocisk.position.y + pocisk.predkosc.y - player.position.y) * (pocisk.position.y + pocisk.predkosc.y - player.position.y));
                if(distance < bot.radius + pocisk.radius)
                {
                    Pociski.splice(i, 1);
                    if(player.pole_ochronne > 0)
                    player.pole_ochronne -= pocisk.damage;
                    else
                    player.health = player.health - pocisk.damage;
                }
                
                let distance2 = Math.sqrt((pocisk.position.x - pocisk.target.x) * (pocisk.position.x - pocisk.target.x) + (pocisk.position.y - pocisk.target.y) * (pocisk.position.y - pocisk.target.y));
                if( 1 < distance2 - pocisk.zasieg)
                {
                  
                   
                  
                    Pociski.splice(i, 1);
                }
            }
                
                }
            })
        }
    
    })
   

}


// GLOWNA PETLA GLOWNA PETLA GLOWNA PETLA GLOWNA PETLA GLOWNA PETLA GLOWNA PETLA GLOWNA PETLA GLOWNA PETLA GLOWNA PETLA GLOWNA PETLA GLOWNA PETLA GLOWNA PETLA GLOWNA PETLA 






animate = () =>
{
    setTimeout(() =>
    {
        requestAnimationFrame(animate);
    }, 10)
  


    c.clearRect(0, 0, canv.width, canv.height)
    c.save()
    c.fillStyle = 'RGBA(0, 190, 150, 0.8)'
    c.fillRect(0, 0, canv.width, canv.height)
    c.fill()
    c.restore()
    if(stop_game())
    {
        kolizja();
    
    Pociski.forEach((pocisk, i) =>
    {
        if(pocisk.usun === 1)
        Pociski.splice(i, 1)
    })
    
   

    bot.forEach((o, i) =>
    {
    if(o.health <= 0)
    {
        bot.splice(i, 1);
        player.punkty = player.punkty + o.wartosc.punkty;
        player.gold = player.gold + o.wartosc.gold;
    }
    })

    
    Kratki.forEach((kratka ) =>
    {

        kratka.draw();
    })

    Pociski.forEach((pocisk) =>
    {
        pocisk.update();
    })
    
    
    bot.forEach((bot) =>
    {
        bot.update();
    })

    player.update();

    Particless.forEach((particle) =>
    {
        particle.update();
    })

    Paski.forEach((pasek, i) =>
    {
        if(i == 0)
        {
            pasek.draw_pasek();
            if(Pasek_wybory_glowny.length>0)
            {
                Pasek_wybory_glowny.forEach((pasek, i) =>
                {
                    pasek.draw_pasek_wybory();
                   
                })
            }
        
        }
    })
   
   
    
    }else
    {
     
    rysuj_tlo();
    if(Pasek_wybory.length>0)
    {
        Pasek_wybory.forEach((pasek, i) =>
        {
            if(pasek.on == 1)
            {
            }
            pasek.draw_pasek_wybory();
           
        })
    }
    Pasek_wybory.forEach(pasek =>
        {
            if(pasek.napis.rysuj === true)
            {
                pasek.draw_napis(canv.width/2-pasek.napis.szerokosc/2, 30);
            }
        })

    }

   
   

    
}

animate();



// ------------ FUNKCJE I ZDARZENIA ------------ FUNKCJE I ZDARZENIA ------------ FUNKCJE I ZDARZENIA ------------ FUNKCJE I ZDARZENIA ------------ FUNKCJE I ZDARZENIA 

kolizja_myszka = (mouse_x, mouse_y, x, y, szerokosc, wysokosc) =>
{
    if(mouse_x > x && mouse_x < x + szerokosc && mouse_y > y && mouse_y < y + wysokosc)
   {
       console.log("true")
    return true
   }
    else 
    {
        console.log("false")
        return false
    }
   

}



canv.addEventListener("click", myszka = (e) =>
{
    const rect = canv.getBoundingClientRect();
    let x = (e.clientX - rect.left + korekta_x);
    let y = (e.clientY - rect.top + korekta_y);

    if(kolizja_myszka(x, y, Pasek_wybory_glowny[0].position.x, Pasek_wybory_glowny[0].position.y , Pasek_wybory_glowny[0].rozmiar.szerokosc, Pasek_wybory_glowny[0].rozmiar.wysokosc))
    {
        if(Paski[0].pasek.stop == false)
        {
            Paski[0].pasek.stop = true
            tryb = "wybor"     

        }
    }

    if(Pasek_wybory.length>0)
    {
        Pasek_wybory.forEach((pasek) =>
        {
            if( kolizja_myszka(x, y, pasek.position.x, pasek.position.y, pasek.rozmiar.szerokosc, pasek.rozmiar.wysokosc) && pasek.typ == "exit")
            {
                Paski[0].pasek.stop = false
                tryb = "gra"
            }

            if( kolizja_myszka(x, y, pasek.position.x, pasek.position.y, pasek.rozmiar.szerokosc, pasek.rozmiar.wysokosc) && pasek.typ == "electro1" && player.gold >= 10 && pasek.on == 0)
            {
                pasek.on = 1;
                player.typ_broni = "electro";
                player.gold =  player.gold -10;
                pasek.RGBA.r = 255;
                pasek.RGBA.g = 255;
                pasek.RGBA.b = 255;
            }
            if( kolizja_myszka(x, y, pasek.position.x, pasek.position.y, pasek.rozmiar.szerokosc, pasek.rozmiar.wysokosc) && pasek.typ == "electro2" && player.gold >= 10)
            {
                pasek.on = 1;
                player.typ_broni = "electro2";
                player.gold = player.gold - 10;
                pasek.RGBA.r = 255;
                pasek.RGBA.g = 255;
                pasek.RGBA.b = 255;
            }
            if( kolizja_myszka(x, y, pasek.position.x, pasek.position.y, pasek.rozmiar.szerokosc, pasek.rozmiar.wysokosc) && pasek.typ == "electro3" && player.gold >= 10 &&  pasek.on == 0)
            {
                pasek.on = 1;
                player.typ_broni = "electro3";
                player.gold =  player.gold - 10;
                pasek.RGBA.r = 255;
                pasek.RGBA.g = 255;
                pasek.RGBA.b = 255;
            }
            if( kolizja_myszka(x, y, pasek.position.x, pasek.position.y, pasek.rozmiar.szerokosc, pasek.rozmiar.wysokosc) && pasek.typ == "shield1" && player.gold >= 10 &&  pasek.on == 0)
            {
                pasek.on = 1;
                player.max_pole_ochronne = 200;
                player.pole_ochronne = 200;
                player.gold =  player.gold - 10;
                pasek.RGBA.r = 255;
                pasek.RGBA.g = 255;
                pasek.RGBA.b = 255;
            }
        })
    }



   

    if(Pasek_wybory_glowny.length>0)
    {
        Pasek_wybory_glowny.forEach((pasek) =>
        {
            if( kolizja_myszka(x, y, pasek.position.x, pasek.position.y, pasek.rozmiar.szerokosc, pasek.rozmiar.wysokosc) && pasek.typ == "budynek")
            {

            }
        })
    }
   
    
    player.target_f(player.bron.wielkosc_pocisku, player.bron.zasieg,player.bron.damage, "electro", player.bron.color, player.bron.predkosc);

}
)

document.addEventListener("keydown", klik_down = (e) =>
{
    console.log(e.keyCode)
    if(e.keyCode == 65 || e.keyCode == 68 || e.keyCode == 87 || e.keyCode == 83)
    player.move(e.keyCode);
    player.skill(e.keyCode)
    
})

document.addEventListener("keyup", klik_up = (e) =>
{
    if(e.keyCode == 65 || e.keyCode == 68 || e.keyCode == 87 || e.keyCode == 83)
    player.stop_move(e.keyCode);
})

canv.addEventListener("mousemove", myszka_ruch = (e) =>
{
    const rect = canv.getBoundingClientRect();
    let x = (e.clientX - rect.left);
    let y = (e.clientY - rect.top);

    if(!stop_game())
    {
        Pasek_wybory.forEach((pasek) =>
        {
        if( kolizja_myszka(x, y, pasek.position.x, pasek.position.y, pasek.rozmiar.szerokosc, pasek.rozmiar.wysokosc))
        {
          switch(pasek.typ)
          {
              case "electro1":
              pasek.napis.tresc = "electro1";
              pasek.napis.rysuj = true;
              break;
              case "electro2":
              pasek.napis.tresc = "electro2";
              pasek.napis.rysuj = true;
              break;
              case "electro3":
              pasek.napis.tresc = "electro3";
              pasek.napis.rysuj = true;
              break;
              case "shield1":
              pasek.napis.tresc = "shield1";
              pasek.napis.rysuj = true;
              break;
              case "exit":
              pasek.napis.tresc = "EXIT";
              pasek.napis.szerokosc = 0;
              pasek.napis.wysokosc = 0;
              pasek.napis.rysuj = true;
              break;
              default:
              pasek.napis.rysuj = false;
              break;
          }
        }else  pasek.napis.rysuj = false;
       })
    }
        
    


    Kratki.forEach(kratka =>
        {
            
            if(x>= kratka.position.x && x <= kratka.position.x + kratka.szerokosc && y >= kratka.position.y && y<= kratka.position.y + kratka.wysokosc)
            {
             kratka.color = "white"
            }
        })

        if(Pasek_wybory_glowny.length>0)
    {
    }

    if(x < 0 )
    Paski[0].pasek.stop = 0;
    
    

    player.obrot_f(x, y);
})


// --------------- TWORZENIE AI I POZIOMY--------------- TWORZENIE AI I POZIOMY--------------- TWORZENIE AI I POZIOMY--------------- TWORZENIE AI I POZIOMY--------------- TWORZENIE AI I POZIOMY--------------- TWORZENIE AI I POZIOMY

let mnoznik_gold = 1;
let mnoznik_punkty = 1;
let mnoznik_wielkosc = 1;
let mnoznik_hp = 1;
let mnoznik_predkosc = 1;

setInterval(zwieksz_poziom = () =>
{
    if(stop_game())
    {
        if( mnoznik_gold < 1.9)
     mnoznik_gold += 0.3;
     if( mnoznik_punkty < 2.2)
     mnoznik_punkty += 0.4;
     if( mnoznik_wielkosc < 2.2)
     mnoznik_wielkosc += 0.4;
     if( mnoznik_hp < 2.5)
     mnoznik_hp += 0.5;
     if( mnoznik_predkosc < 1.6)
     mnoznik_predkosc += 0.2;
    }
    

}, 20000)

    setInterval(spawn_yellow = () =>
    {
        if(stop_game())
        {
        spawn_x = -20;
        spawn_y = (Math.random() * 1000);
        bot.push(new Bot({position:{x: spawn_x, y: spawn_y}, wartosc:{gold: 5* mnoznik_gold, punkty: 10 * mnoznik_punkty}}, "yellow", 10* mnoznik_wielkosc, 60 * mnoznik_hp, 0.2 * mnoznik_predkosc, 'start'))
        }
    }, 4000)
    
    setInterval(spawn_orange = () =>
    {
        if(stop_game())
        {
        spawn_x = -20;
        spawn_y = (Math.random() * 1000);
        bot.push(new Bot({position:{x: spawn_x, y: spawn_y}, wartosc:{gold: 10 * mnoznik_gold, punkty: 30 * mnoznik_punkty}}, "orange", 10 * mnoznik_wielkosc, 100 * mnoznik_hp, 0.3 * mnoznik_predkosc, 0))
        }
    }, 10000)
    
    setInterval(spawn_red = () =>
    {
        if(stop_game())
        {
        spawn_x = -20;
        spawn_y = (Math.random() * 1000);
        bot.push(new Bot({position:{x: spawn_x, y: spawn_y}, wartosc:{gold: 15 * mnoznik_gold, punkty: 50 * mnoznik_punkty}}, "red", 10* mnoznik_wielkosc, 150* mnoznik_hp, 0.4* mnoznik_predkosc, 0))
        }
    }, 15000)
    
    setInterval(spawn_darkblue = () =>
    {
        if(stop_game())
        {
        spawn_x = -20;
        spawn_y = (Math.random() * 1000);
        bot.push(new Bot({position:{x: spawn_x, y: spawn_y}, wartosc:{gold: 50 * mnoznik_gold, punkty: 300 * mnoznik_punkty}}, "darkblue", 10* mnoznik_wielkosc, 600* mnoznik_hp, 0.7* mnoznik_predkosc, 0))
        }
    }, 40000)
    
 
    
stop_game = () =>
{
    if(Paski[0].pasek.stop == false)
    {
        return true;
    }else
     return false;
}


setInterval(ai = () =>
{
    bot.forEach((b) =>
    {
        b.ustaw_target(player.position.x, player.position.y);
        b.move();
        if(b.bron_typ != 0)
        {
            b.atak_b();
        }
    })

    if(!stop_game())
    {
    rysuj_tlo();
    }

}, 100)


# Copyright (c) 2026 Abraham Ukachi. The abElements Project.
# @authors: Abraham Ukachi <abrahamukachi@gmail.com>
# Generates the 14 layout-rule SVGs (light + dark) into .github/layout/.
# No animation. Each file has a title and a description. Text colours clear WCAG AA.
import os
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".github", "layout")
T={"light":dict(bg="#F9FAF4",fg="#191C19",fg2="#414941",pane="#EDEEE9",pane2="#E7E9E3",slot="#D3E8D3",line="#717970",line2="#C1C9BF",scroll="#9DF6B1",scrollfg="#00210C",prim="#066D37",bronze="#8A6440",drawer="#F3E6D8",drawerfg="#4A3420",tert="#3A656E",bad="#BA1A1A"),
   "dark":dict(bg="#111411",fg="#C5C7C2",fg2="#C1C9BF",pane="#1D201D",pane2="#282B27",slot="#394B3B",line="#8B938A",line2="#414941",scroll="#005227",scrollfg="#9DF6B1",prim="#81D997",bronze="#D9AB7F",drawer="#3A2C1F",drawerfg="#F3E6D8",tert="#A2CED9",bad="#FFB4AB")}
class S:
    def __init__(s,c,w,h): s.c=c;s.w=w;s.h=h;s.o=[]
    def r(s,x,y,w,h,fill,stroke=None,dash=False,rx=6,sw=1.5,op=1):
        st=f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ''
        d=' stroke-dasharray="6 4"' if dash else ''
        s.o.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"{st}{d} opacity="{op}"/>')
    def t(s,x,y,txt,size=14,fill=None,anchor="middle",weight="normal",mono=False):
        f="Roboto Mono,DejaVu Sans Mono,monospace" if mono else "Roboto,Inter,DejaVu Sans,sans-serif"
        txt=txt.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
        s.o.append(f'<text x="{x}" y="{y}" font-size="{size}" font-family="{f}" fill="{fill or s.c["fg"]}" text-anchor="{anchor}" font-weight="{weight}">{txt}</text>')
    def l(s,x1,y1,x2,y2,col,sw=2,arrow=True,dash=False):
        d=' stroke-dasharray="5 4"' if dash else ''
        m=' marker-end="url(#ah)"' if arrow else ''
        s.o.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{col}" stroke-width="{sw}"{d}{m}/>')
    def slot(s,x,y,w,h,label,sub=None):
        s.r(x,y,w,h,s.c["slot"],s.c["prim"],True)
        s.t(x+w/2,y+h/2+(0 if sub else 5),label,13,weight="bold")
        if sub: s.t(x+w/2,y+h/2+16,sub,11,s.c["fg2"])
    def scroll(s,x,y,w,h,label,sub="↕ scrolls on its own"):
        s.r(x,y,w,h,s.c["scroll"],s.c["prim"])
        s.t(x+w/2,y+h/2-2,label,14,s.c["scrollfg"],weight="bold")
        if sub: s.t(x+w/2,y+h/2+18,sub,12,s.c["scrollfg"])
    def drawer(s,x,y,w,h,label):
        s.r(x,y,w,h,s.c["drawer"],s.c["bronze"],sw=2.5)
        s.t(x+w/2,y+h/2+5,label,12,s.c["drawerfg"],weight="bold")
    def save(s,name,mode,title,desc):
        c=s.c
        svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="{s.w}" height="{s.h}" viewBox="0 0 {s.w} {s.h}" role="img" aria-labelledby="t d">
<title id="t">{title}</title>
<desc id="d">{desc}</desc>
<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="{c["bronze"]}"/></marker></defs>
<rect width="100%" height="100%" fill="{c["bg"]}"/>
'''+"\n".join(s.o)+"\n</svg>\n"
        open(f"{OUT}/{name}-{mode}.svg","w").write(svg)

def legend(s,y):
    c=s.c;x=30
    for fill,st,dash,lab in [(c["slot"],c["prim"],True,"slot · 0px when empty"),(c["scroll"],c["prim"],False,"scroller (overflow:auto)"),(c["pane"],c["line"],False,"fixed box (overflow:hidden)"),(c["drawer"],c["bronze"],False,"drawer")]:
        s.r(x,y,22,16,fill,st,dash,rx=3); s.t(x+30,y+13,lab,12,c["fg2"],"start"); x+=215

def anatomy(c,s,ox=0,oy=0,W=900,H=470,titleline=True):
    s.r(ox+20,oy+20,W-40,H-40,c["pane"],c["line"],sw=2.5,rx=12)
    if titleline: s.t(ox+W/2,oy+42,"AbAppLayout · height:100dvh · overflow:hidden · the document never scrolls",13,c["fg2"])
    s.slot(ox+40,oy+54,W-80,40,"header","app header · 0px + hidden when empty")
    top=oy+104;bot=oy+H-94;h=bot-top
    s.r(ox+40,top,150,h,c["pane2"],c["line"]); s.scroll(ox+50,top+10,130,h-20,"sidebar","↕ scrolls")
    mw=(W-80-150-20)*0.58; mx=ox+200
    s.r(mx,top,mw,h,c["pane2"],c["line"]); s.t(mx+mw/2,top-0+0,"",1)
    s.slot(mx+10,top+10,mw-20,40,"mainHeader"); s.scroll(mx+10,top+60,mw-20,h-120,"main content"); s.slot(mx+10,bot-50,mw-20,40,"mainBar")
    ax=mx+mw+10; aw=ox+W-40-ax
    s.r(ax,top,aw,h,c["pane2"],c["line"]); s.slot(ax+10,top+10,aw-20,40,"asideHeader"); s.scroll(ax+10,top+60,aw-20,h-120,"aside content","↕ scrolls"); s.slot(ax+10,bot-50,aw-20,40,"asideBar")
    s.slot(ox+40,bot+10,W-80,40,"footer","app footer · 0px + hidden when empty")
    return mx,mw,ax,aw,top,bot

for mode,c in T.items():
    # 1 anatomy
    s=S(c,900,560); s.t(450,0,"",1)
    anatomy(c,s); s.t(260,104+8,"",1)
    legend(s,505); s.t(870,545,"AbMainLayout (centre) · AbAsideLayout (right)",11,c["fg2"],"end")
    s.save("layout-anatomy",mode,"The Ab layout rule: anatomy","AbAppLayout fills 100dvh and never scrolls. Rows: header, then sidebar plus AbMainLayout plus AbAsideLayout, then footer. Main has mainHeader, scrolling content and mainBar; aside has asideHeader, scrolling content and asideBar. Header, footer and bars are 0px and hidden when empty.")

    # 2 scroll regions
    s=S(c,900,600)
    s.r(20,20,860,60,c["pane"],c["bad"],True); s.t(450,46,"🔒 html, body { overflow:hidden; height:100% } — the document never scrolls",14,c["bad"],weight="bold"); s.t(450,68,"no window scroll listeners · no rubber-band of the whole page on iOS",12,c["fg2"])
    s.r(20,95,860,410,c["pane"],c["line"],sw=2.5,rx=12); s.t(450,115,"AbAppLayout · grid-template-rows: auto 1fr auto · height:100dvh (fallback 100vh)",12,c["fg2"])
    s.slot(40,125,820,34,"header · padding-top: env(safe-area-inset-top)")
    s.r(40,169,820,262,c["pane2"],c["line"]); s.t(450,186,"panes row · min-height:0 (lets children shrink so they can scroll)",12,c["fg2"])
    for x,w,lab in [(50,150,"sidebar"),(210,380,"main content"),(600,250,"aside content")]:
        s.scroll(x,194,w,226,lab,"overflow:auto"); s.t(x+w/2-(10 if w<200 else 0),388,"overscroll:contain" if w<200 else "overscroll-behavior:contain",11,c["scrollfg"],mono=True)
        s.l(x+w-18,240,x+w-18,370,c["bronze"],3); s.l(x+w-18,370,x+w-18,240,c["bronze"],3)
    s.slot(40,441,820,34,"footer · padding-bottom: env(safe-area-inset-bottom)")
    s.t(450,494,"each pane: min-height:0; overflow:hidden → its content wrapper: overflow:auto; scrollbar-gutter:stable",12,c["fg2"],mono=True)
    legend(s,530); s.t(450,580,"<meta name=\"viewport\" content=\"…, viewport-fit=cover\">",12,c["fg2"],mono=True)
    s.save("layout-scroll-regions",mode,"What scrolls in the Ab layout","The document is locked. Only three regions scroll, each on its own: the sidebar, main content and aside content. The panes row has min-height 0, the app uses 100dvh, header and footer pad with safe-area insets, and every scroller uses overscroll-behavior contain.")

    # 3 empty chrome
    s=S(c,900,520)
    for i,(ox,filled) in enumerate([(20,True),(470,False)]):
        s.t(ox+205,40,"With content" if filled else "Empty (null or :empty)",16,weight="bold")
        s.r(ox,55,410,380,c["pane"],c["line"],sw=2.5,rx=10)
        y=65
        if filled: s.slot(ox+10,y,390,36,"header (has content)"); y+=46
        if filled: s.slot(ox+20,y,370,30,"mainHeader"); y+=38
        hh=(425-y)-(84 if filled else 0)
        s.scroll(ox+20,y,370,hh,"main content","gets all freed space" if not filled else "↕ scrolls"); y+=hh+8
        if filled: s.slot(ox+20,y,370,30,"mainBar"); s.slot(ox+10,y+38,390,0.1 if False else 0,"") if False else None
        if filled: s.t(ox+205,450+0,"",1)
    for yy,lab in [(66,"header 0px"),(424,"footer · mainBar 0px")]:
        s.l(880,yy,880,yy,c["bronze"],arrow=False); s.r(470+290,yy-12 if yy<100 else yy-14,120,22,c["drawer"],c["bronze"],rx=11); s.t(470+350,yy+3 if yy<100 else yy+1,lab if yy<100 else "bars 0px",11,c["drawerfg"],weight="bold")
    s.t(450,470,"Not rendered when the prop is null, and an empty slot is display:none as a CSS safety net.",13,c["fg2"])
    s.t(450,495,"No hard-coded offsets: no --ab-app-bar-height, no padding-top:64px. The grid row is auto, so empty = 0px.",13,c["fg2"])
    s.save("layout-empty-chrome",mode,"Empty header, footer and bars take no space","Left: a layout with header, mainHeader and mainBar filled. Right: the same layout with them empty; they are not rendered and measure 0px, so main content takes all the space.")

    # 4 drawer scopes
    s=S(c,960,600)
    s.t(480,32,"AbDrawer · scope = where it is clipped · side = where it slides from",16,weight="bold")
    for i,(sc,desc) in enumerate([("app","covers the whole app"),("main","inside AbMainLayout only"),("aside","inside AbAsideLayout only")]):
        ox=20+i*315; s.t(ox+150,62,f'scope="{sc}"',14,c["prim"],weight="bold",mono=True); s.t(ox+150,80,desc,12,c["fg2"])
        s.r(ox,90,300,260,c["pane"],c["line"],sw=2,rx=8); s.r(ox+8,98,284,20,c["slot"],c["prim"],True,rx=3)
        s.r(ox+8,124,70,218,c["pane2"],c["line"],rx=4); s.r(ox+84,124,128,218,c["pane2"],c["line"],rx=4); s.r(ox+218,124,74,218,c["pane2"],c["line"],rx=4)
        s.t(ox+43,240,"side",10,c["fg2"]); s.t(ox+148,240,"main",11,c["fg2"]); s.t(ox+255,240,"aside",10,c["fg2"])
        if sc=="app": s.r(ox,90,300,260,"#000",None,op=0.35,rx=8); s.drawer(ox,250,300,100,'side="bottom" · languages')
        if sc=="main": s.r(ox+84,124,128,218,"#000",None,op=0.35,rx=4); s.drawer(ox+84,124,128,90,'side="top"'); s.t(ox+148,232,"confirm / cancel",10,c["drawerfg"]) if False else None
        if sc=="aside": s.r(ox+218,124,74,218,"#000",None,op=0.35,rx=4); s.drawer(ox+226,124,66,218,'right')
    s.t(480,385,"side = top · bottom · left · right (any scope)",14,weight="bold")
    for i,side in enumerate(["top","bottom","left","right"]):
        ox=60+i*220; s.r(ox,400,180,120,c["pane2"],c["line"],rx=6)
        d={"top":(ox,400,180,50),"bottom":(ox,470,180,50),"left":(ox,400,70,120),"right":(ox+110,400,70,120)}[side]
        s.drawer(*d,side)
        ar={"top":(ox+90,455,ox+90,480),"bottom":(ox+90,465,ox+90,440),"left":(ox+75,460,ox+105,460),"right":(ox+105,460,ox+75,460)}[side]
        s.l(*ar,c["bronze"],2.5)
    s.t(480,550,"Scrim dims only its scope · rest of the scope is inert · Escape / scrim click closes · focus returns to the trigger",12,c["fg2"])
    s.t(480,572,"240ms slide · no motion under prefers-reduced-motion · no JS: rendered as an in-flow section",12,c["fg2"])
    s.save("layout-drawer-scopes",mode,"AbDrawer scopes and sides","Three scopes: app (covers everything, here a bottom language drawer), main (clipped to the main layout, here from the top) and aside (clipped to the aside, here from the right). Below, the four sides: top, bottom, left, right.")

    # 5 breakpoints
    s=S(c,1060,520)
    cols=[(390,"390 · phone","one pane · bottom bar · aside is a drawer",False,False,True),
          (768,"768 · tablet","sidebar or rail · aside is a right drawer",True,False,False),
          (1180,"1180 · laptop","sidebar + main + aside pane",True,True,False),
          (1920,"1920 · desktop","same panes, with a gap",True,True,False)]
    widths=[120,180,260,340]; ox=20
    for (bp,lab,sub,side,aside,phone),w in zip(cols,widths):
        h=340 if phone else 280; y=60
        s.t(ox+w/2,40,lab,14,weight="bold")
        s.r(ox,y,w,h,c["pane"],c["line"],sw=2,rx=8); s.r(ox+6,y+6,w-12,18,c["slot"],c["prim"],True,rx=3)
        iy=y+30; ih=h-60
        if phone:
            s.scroll(ox+6,iy,w-12,ih,"main","↕"); s.r(ox+6,y+h-26,w-12,20,c["slot"],c["prim"],True,rx=3); s.t(ox+w/2,y+h-12,"mainBar / nav",10)
        else:
            sw_=24 if bp==768 else (60 if bp==1180 else 70)
            s.scroll(ox+6,iy,sw_,ih,"","" ); s.t(ox+6+sw_/2,iy+ih/2,"rail" if bp==768 else "side",10,c["scrollfg"])
            aw=90 if bp in (1180, 1920) else 0
            mw=w-12-sw_-6-(aw+6 if aw else 0)
            dw=(64 if bp==768 else 0)
            s.scroll(ox+12+sw_,iy,mw,ih,"","")
            s.t(ox+12+sw_+(mw-dw)/2,iy+ih/2,"main",13,c["scrollfg"],weight="bold"); s.t(ox+12+sw_+(mw-dw)/2,iy+ih/2+18,"↕",12,c["scrollfg"])
            if aw: s.scroll(ox+18+sw_+mw,iy,aw,ih,"aside","↕")
            if bp==768: s.drawer(ox+w-70,iy,64,ih,"aside")
            s.r(ox+6,y+h-26,w-12,20,c["slot"],c["prim"],True,rx=3)
        words=sub.split(" · ")
        for k,wd in enumerate(words): s.t(ox+w/2,y+h+24+k*17,wd,11,c["fg2"])
        ox+=w+(30)
    legend(s,480)
    s.save("layout-breakpoints",mode,"Layout at 390, 768, 1180 and 1920 pixels","At 390 one pane and the aside is a drawer; at 768 the sidebar is a rail and the aside is a right drawer; at 1180 and 1920 the sidebar, main and aside are all visible, with a gap at 1920. The document never scrolls at any width.")

    # 6 scroll spy
    s=S(c,900,520)
    s.r(20,20,860,420,c["pane"],c["line"],sw=2.5,rx=12)
    s.r(40,40,520,380,c["scroll"],c["prim"],sw=2.5); s.t(300,62,"main content = IntersectionObserver root",13,c["scrollfg"],weight="bold")
    s.t(300,80,"useAbPage().mainScrollElement",12,c["scrollfg"],mono=True)
    for i,(sid,act) in enumerate([("#install",False),("#usage",True),("#api",False)]):
        y=95+i*105; s.r(60,y,480,92,c["bg"],c["bronze"] if act else c["line2"],sw=3 if act else 1.5)
        s.t(80,y+28,f'<section id="{sid[1:]}">',12,c["fg"],"start",mono=True); s.t(80,y+50,"scroll-margin-top: 0 (no fixed bar to clear)",11,c["fg2"],"start")
        if act: s.t(80,y+74,"✓ intersecting → active",12,c["bronze"],"start",weight="bold")
    s.r(580,40,280,380,c["pane2"],c["line"]); s.t(720,62,"aside · AbToc",13,weight="bold")
    for i,(lab,act) in enumerate([("Install",False),("Usage",True),("API",False)]):
        y=80+i*44; s.r(600,y,240,34,c["drawer"] if act else c["bg"],c["bronze"] if act else c["line2"],rx=17); s.t(720,y+22,lab+(" ← active" if act else ""),13,c["drawerfg"] if act else c["fg"])
    s.l(560,245,600,147,c["bronze"],2.5)
    s.t(720,260,"click → scrollToAbSection(id,",12,c["fg"],mono=True); s.t(720,278,"{ container: mainScrollElement })",11,c["fg"],mono=True)
    s.t(720,310,"never window.scrollTo",12,c["bad"],weight="bold")
    s.t(450,470,"useAbScrollSpy(['install','usage','api'], { root: mainScrollElement })",13,c["fg"],mono=True)
    s.t(450,495,"The window never scrolls, so a window-based spy would never fire. Always pass the main scroller.",12,c["fg2"])
    s.save("layout-scroll-spy",mode,"Scroll spy with the main scroller as root","Sections inside the main content scroller are observed with the main scroller as IntersectionObserver root. The visible section, Usage, is marked active in the AbToc in the aside. Clicking a TOC item scrolls the main container, never the window.")

    # 7 welcome mapping
    s=S(c,960,600)
    s.t(180,32,"Welcome today",15,weight="bold"); s.t(700,32,"Welcome on the layout rule",15,weight="bold")
    s.r(80,50,200,520,c["pane"],c["line"],sw=2.5,rx=22)
    parts=[("top bar · logo · globe",62,40),("counter 3 / 9",112,30),("slide",152,300),("‹  Skip  ›",462,40)]
    ys={}
    for lab,y,h in parts: s.r(92,y,176,h,c["pane2"],c["line"],rx=6); s.t(180,y+h/2+5,lab,12); ys[lab]=y+h/2
    s.r(500,50,420,520,c["pane"],c["line"],sw=2.5,rx=12)
    tgt=[("app header","AbAppLayout header",62,40,"slot"),("mainHeader","AbMainLayout mainHeader",112,30,"slot"),("main content","slide · ↕ scrolls if tall",152,240,"scroll"),("mainBar","AbMainLayout mainBar",402,40,"slot")]
    ty={}
    for lab,sub,y,h,k in tgt:
        if k=="slot": s.slot(512,y,396,h,lab+"  ·  "+sub)
        else: s.scroll(512,y,396,h,lab,sub)
        ty[lab]=y+h/2
    s.drawer(512,452,396,106,'globe → AbDrawerList side="bottom"')
    for a,b in [("top bar · logo · globe","app header"),("counter 3 / 9","mainHeader"),("slide","main content"),("‹  Skip  ›","mainBar")]:
        s.l(270,ys[a],508,ty[b],c["bronze"],2)
    s.l(250,82,508,505,c["bronze"],2,dash=True)
    s.t(390,590,"footer: none → 0px · no aside on Welcome → aside not rendered · desktop keeps the globe popover menu",12,c["fg2"])
    s.save("layout-welcome-mapping",mode,"Welcome mapped onto the layout rule","The Welcome top bar becomes the app header, the slide counter becomes mainHeader, the slide becomes main content, the arrows and Skip become mainBar, and on mobile the globe opens a bottom app-scoped drawer with the languages. Footer and aside are empty and take no space.")
print("ok")

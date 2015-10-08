import os
import json
import sys
import copy
import math

from multiprocessing import Process
from reportlab.pdfgen import canvas
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.lib import colors
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.lib.utils import ImageReader
from reportlab.lib.pagesizes import letter
from reportlab.platypus import Paragraph
from reportlab.lib.styles import getSampleStyleSheet

PAGEWIDTH, PAGEHEIGHT = letter

# register Open Sans
pdfmetrics.registerFont(TTFont('Open Sans', 'assets/fonts/fonts-open-sans/OpenSans-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Open Sans Bold', 'assets/fonts/fonts-open-sans/OpenSans-Bold.ttf'))


# get the immediate directories of a directory
def get_immediate_subdirectories(a_dir):
    return [name for name in os.listdir(a_dir)
            if os.path.isdir(os.path.join(a_dir, name))]


# draw a multiline string
def drawMultiString( c, x, y, s ):
    for ln in s.split('\n'):
        c.drawString( x, y, ln )
        y -= c._leading
    return c

# read
f = open(os.path.dirname(os.path.realpath(__file__)) + "/scripts/parsed_data/data.json", "r")
data = json.load(f)

f = open(os.path.dirname(os.path.realpath(__file__)) + "/scripts/parsed_data/problem_type.json", "r")
problem_type = json.load(f)


################################
# Function HeaderOverview - header for overview page
def drawPdf(canvas, donor):
    donor_name = donor.replace('_', ' ')

    canvas.saveState()
    headboxh = 80
    headboxx = 20
    headboxy = 695
    headboxw = 570
    footboxh = 65
    footboxx = 20
    footboxy = 20
    footboxw = 570

    # aiddata logo
    logouri = "assets/images/aiddata_main_wht.png"
    mapuri = "donors/" + donor + "/map.png"
    influenceuri = "donors/" + donor + "/influence.png"
    adviceuri = "donors/" + donor + "/advice.png"
    advicelegenduri = "assets/images/bubble_legend.png"
    compuri = "donors/" + donor + "/comp.png"
    comp2uri = "donors/" + donor + "/comp2.png"

    # blue header
    canvas.setFillColorRGB(.086, .121, .203)
    canvas.rect(headboxx, headboxy, headboxw, headboxh, fill=1)
    canvas.saveState()
    canvas.setFillColor(colors.white)
    canvas.setFont('Open Sans', 20)
    canvas.drawString(headboxx + 160, headboxy + .425 * headboxh, "Development Partner Profile")

    # green header
    headboxh = 30
    headboxx = 20
    headboxy = 665
    headboxw = 570
    canvas.setFillColorRGB(.461, .711, .340)
    canvas.rect(headboxx, headboxy, headboxw, headboxh, fill=1)
    canvas.saveState()
    canvas.setFillColor(colors.white)
    canvas.setFont('Open Sans', 18)
    donor_year = donor_name + " 2015"
    textWidth = stringWidth(donor_year, "Open Sans", 18)
    canvas.drawString(headboxx + headboxw - (textWidth + 10), headboxy + .30 * headboxh, donor_name + " 2015")

    # add logo
    logo = ImageReader(logouri)
    canvas.drawImage(logo, 30, 700, 120, 68,preserveAspectRatio=True, mask='auto')


    # add map
    canvas.setFont('Open Sans', 12)
    canvas.setFillColor(colors.black)
    title_str = "Distribution of " + donor_name + "'s"
    textWidth = stringWidth(title_str, "Open Sans", 12)
    pl = (PAGEWIDTH / 2) - (textWidth / 2)
    canvas.drawString(pl, 650, title_str)
    title_str = "Official Development Assistance(ODA) 2004-2013"
    textWidth = stringWidth(title_str, "Open Sans", 12)
    pl = (PAGEWIDTH / 2) - (textWidth / 2)
    canvas.drawString(pl, 638, title_str)
    map = ImageReader(mapuri)
    canvas.drawImage(map, 75, 305, 450, 350, mask='auto')

    # add influence chart
    canvas.setFont('Open Sans', 12)
    canvas.setFillColor(colors.black)
    title_str = "Three Aspects of " + donor_name + "'s Performance in the Countries It Influences Most"
    textWidth = stringWidth(title_str, "Open Sans", 12)
    pl = (PAGEWIDTH / 2) - (textWidth / 2)
    canvas.drawString(pl, 310, title_str)
    influence = ImageReader(influenceuri)
    canvas.drawImage(influence, 80, 20, 450, 275, mask='auto')

    # move to next page
    canvas.showPage()

    # add advice chart
    canvas.setFont('Open Sans', 12)
    canvas.setFillColor(colors.black)
    title_str = "Usefulness of Advice, Volume of ODA and Agenda-Setting Influence, by Policy Area"
    textWidth = stringWidth(title_str, "Open Sans", 12)
    pl = (PAGEWIDTH / 2) - (textWidth / 2)
    canvas.drawString(pl, 750, title_str)
    advice = ImageReader(adviceuri)
    canvas.drawImage(advice, 75, 530, 350, 200, mask='auto')
    advicelegend = ImageReader(advicelegenduri)
    canvas.drawImage(advicelegend, 450, 545,150,200, mask='auto')

    # add advice comp chart
    canvas.setFillColor(colors.black)
    title_str = "<para align='center'>Usefulness of " + donor_name + "'s Advice Compared to the Average</para>"
    canvas.setFont('Open Sans', 6)
    comp_title_para = Paragraph(title_str, getSampleStyleSheet()["Normal"])
    comp_title_para.wrapOn(canvas, 300, 200)
    comp_title_para.drawOn(canvas, 30, 500)
    legend_y = 487
    stroke_length = 30
    green_stroke_pos = 50
    red_stroke_pos = 200
    offset = 10
    canvas.setStrokeColorRGB(.461, .711, .340)
    canvas.line(green_stroke_pos, legend_y + 2, green_stroke_pos + stroke_length, legend_y + 2)
    canvas.setStrokeColorRGB(.890, .118, .118)
    canvas.line(red_stroke_pos, legend_y + 2, red_stroke_pos + stroke_length, legend_y + 2)
    key_str1 = "All Other Development Partners"
    canvas.drawString(green_stroke_pos + stroke_length + offset, legend_y, key_str1)
    canvas.drawString(red_stroke_pos + stroke_length + offset , legend_y, donor_name)
    comp = ImageReader(compuri)
    comp_x = 85
    comp_width = 175
    comp_y = 280
    comp_height = -80
    canvas.drawImage(comp, comp_x, comp_y, comp_x + comp_width, comp_y + comp_height, mask='auto')


    # add comp2 chart
    title_str = "<para align='center'>Three Dimensions of  " + \
            donor_name + "'s Performance Compared to Other Development Partners</para>"
    margin = 10
    comp2_title_para = Paragraph(title_str, getSampleStyleSheet()["Normal"])
    comp2_title_para.wrapOn(canvas, PAGEWIDTH - 2*margin, 200)
    comp2_title_para.drawOn(canvas, margin, 250)
    comp2 = ImageReader(comp2uri)
    canvas.drawImage(comp2, 45, 110, 525, 125, mask='auto')


    # blue footer
    canvas.setStrokeColorRGB(.086, .121, .203)
    canvas.setFillColorRGB(.086, .121, .203)
    canvas.rect(footboxx, footboxy, footboxw, footboxh, fill=1)
    canvas.saveState()
    canvas.setFillColor(colors.white)

    # add logo
    logo = ImageReader(logouri)
    canvas.drawImage(logo, 475, 18, 120, 68, preserveAspectRatio=True, mask='auto')
    
    #add footer info
    datastr1 = "<font color='white' fontName='Open Sans' size=6>hello</font>"
    pData1 = Paragraph(datastr1, getSampleStyleSheet()["Normal"])
    pData1.wrapOn(canvas, 150, 20)
    pData1.drawOn(canvas, 25, 70)
    
    datastr2 = "<font color='white' fontName='Open Sans' size=6>hello2</font>"
    pData2 = Paragraph(datastr2, getSampleStyleSheet()["Normal"])
    pData2.wrapOn(canvas, 150, 20)
    pData2.drawOn(canvas, 180, 70)

    
    # problem type ranking
    canvas.setFillColor(colors.black)
    title_str = donor_name + "'s Influence in Designing\nReforms for Different Problem Types"
    rank_title_para = Paragraph(title_str, getSampleStyleSheet()["Normal"])
    rank_title_para.wrapOn(canvas, 180, 100)
    rank_title_para.drawOn(canvas, 400, 490)

	#set dnr to first element, and find the correct one
    dnr = data[0]
    for d in data:
        if str(d["NameofDonor"]) == donor:
            dnr = d
            break

    ptype = copy.deepcopy(problem_type)
    for prob in ptype:
        prob["score"] = dnr["Q22_" + prob["Code"]]

    ptype = filter(lambda x: x["score"] != "", ptype) # get rid of no data

    for prob in ptype:
        prob["score"] = float(prob["score"])

    ptype = sorted(ptype, key=lambda p: p["score"])

    if len(ptype) != 0:
        num = int(min(math.ceil(float(len(ptype)) / 2), 3))
        top = [None] * num
        bottom = [None] * num
        for i in range(0, num):
            top[i] = ptype[-1 * (i + 1)]
            bottom[i] = ptype[i]

        top_str = """
            <font color='green' size=12><b>More Influential</b></font><br/>
        """
        bottom_str = """
            <font color='red' size=12><b>Less Influential</b></font><br/>
        """
        for i, pt in enumerate(top):
            top_str += "<font color='green' fontName='Open Sans' size=8>" + \
                "%d. " % (i + 1) + pt["ProblemTypeLong"] + " ({0:.2f})".format(pt["score"]) + "<br/>" + \
            "</font>"
        for i, pt in enumerate(bottom):
            bottom_str += "<font color='red' fontname='Open Sans' size=8>" + \
                "%d. " % (i + 1) + pt["ProblemTypeLong"] + " ({0:.2f})".format(pt["score"]) + "<br/>" + \
            "</font>"

        pTop = Paragraph(top_str, getSampleStyleSheet()["Normal"])
        pTop.wrapOn(canvas, 150, 400)
        pTop.drawOn(canvas, 400, 400)

        pBottom = Paragraph(bottom_str, getSampleStyleSheet()["Normal"])
        pBottom.wrapOn(canvas, 150, 400)
        pBottom.drawOn(canvas, 400, 290)

    return canvas


donor_dirs = get_immediate_subdirectories("donors")

def writePdf(donor):
    c = canvas.Canvas("donors/" + donor + "/donor_profile.pdf", pagesize=letter)
    c.setLineWidth(.3)
    c.setFont('Open Sans', 12)

    c = drawPdf(c, donor)

    c.save()

jobs = []
for donor in donor_dirs:
    p = Process(target=writePdf, args=(donor,))
    jobs.append(p)
    p.start()

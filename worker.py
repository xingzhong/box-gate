from pymongo import Connection
import datetime
from sklearn import linear_model
import numpy as np

conn = Connection('localhost', 27017)

db = conn.test
record = db.records
geo = []
mag = []
for r in record.find():
	geo.append([r['Lat'], r['Lon'], r['Depth']])
	mag.append(r['Magnitude'])

geo_train = geo[:-100]
mag_train = mag[:-100]
geo_test = geo[-100:]
mag_test = mag[-100:]

clf = linear_model.LinearRegression()
clf.fit(geo_train,mag_train)
print clf.coef_
print np.mean((clf.predict(geo_test) - mag_test)**2)
print clf.score(geo_test, mag_test)

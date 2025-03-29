from setuptools import setup, find_packages

setup(
    name="ilikepdfpy",
    version="0.1",
    packages=find_packages(),
    install_requires=["PyMuPDF"],
    description='A toolbox based on PyMuPDF for PDF manipulation',
    author='Sylvain Finot',
)

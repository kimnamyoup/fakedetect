import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import '../css/DragnDrop.css';

const DragnDrop = () => {

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);

    const onDrop = useCallback(acceptedFiles => {

        const file = acceptedFiles[0];
        if (file) {
            setSelectedFile(file);

            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
        }
    }, [previewUrl]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDragEnter: true,
        accept: { 'image/*': [] },
        multiple: false
    });


    const handleDetect = async () => {
        if (!selectedFile) {
            alert("딥페이크를 탐지할 이미지를 먼저 선택해주세요.");
            return;
        }

        setIsLoading(true); // 로딩 시작
        setResult(null);    // 이전 결과 초기화

        const formData = new FormData();

        formData.append('image_file', selectedFile);

        try {

            const response = await fetch(' https://a97d670d9f0f.ngrok-free.app/APITest', {
                method: 'POST',
                body: formData,

            });
            if (!response.ok) {
                // 서버가 보낸 에러 메시지를 얻으려고 시도
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.Error || `서버 에러: ${response.status}`);
            }
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error("탐지 중 오류 발생:", error);
            setResult({ error: "서버와 통신 중 오류가 발생했습니다." });
        } finally {
            setIsLoading(false); // 로딩 종료
        }
    };
    const handleReset=()=>{
        setSelectedFile(null)
        setResult(null)
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
    }

  
    return (
        <div className="main-container">
            <div className="detector">
                <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                <input {...getInputProps()} />

                {previewUrl ? (
                    <img src={previewUrl} alt="선택한 이미지 미리보기" className="preview-image" />
                ) : (
                    <p>{isDragActive ? 'Drop Image' : '여기에 이미지를 드롭하거나 클릭하세요'}</p>
                )}
            </div>
            <div className="btnG">
                <button onClick={handleDetect} className="detect-button" disabled={!selectedFile || isLoading}>
                {isLoading ? '탐지 중...' : '탐지하기'}
            </button>
            <button onClick={handleReset} className="reset-button" disabled={!selectedFile || isLoading} style={{
                visibility:result ? '1':'0',
                opacity: result ? '1':'0',
                transition:"all .3s"
            }}>리셋</button>
            </div>

            </div>
            
            


            {result && (
                <div className="result-box">
                    <h3>탐지 결과</h3>
                    {result.error ? (
                        <p className="result-error">{result.error}</p>
                    ) : (
                        <div className="resTxts">
                            <p className={`result-prediction ${result.result?.toLowerCase()}`}>
                                이미지는 <strong>{result.result === 'Fake' ? '가짜(Fake)' : '진짜(Real)'}이미지 입니다</strong> .
                            </p>
                            <p className="result-confidence">
                                <strong>{(result.probability * 100).toFixed(2)}%</strong>
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default DragnDrop;